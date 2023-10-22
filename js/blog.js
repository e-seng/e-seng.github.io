window.addEventListener("load", async () => {
  const ALLOWED_FILETYPES = [
    "md",
    "txt",
    "py",
    "c",
    "Dockerfile",
    /// TODO: add more as needed
  ]

  function getFiletype(filepath) {
    return filepath.split('.').splice(-1)[0];
  }

  async function openBreadcrumb() {
    let breadcrumb = document.location.href.split('#').slice(-1)[0];
    let possibleParentElements = document.querySelectorAll(".blog-category");
    let crumbs = breadcrumb.split('/');
    let path = Array.from(crumbs);
    path[0] = ''

    // get opened filetree
    let filetree = {};
    await Promise.all(crumbs.map(async (crumb, crumbIndex) => {
      filetree[crumb] = await getGithubFiles(path.slice(0, crumbIndex+1).join('/'));
    }));

    console.log(filetree);

    crumbs.forEach((crumb, crumbIndex) => {
      var crumb = crumbs[crumbIndex]
      var updateParents = [];

      possibleParentElements.forEach((element) => {
        if(!element.innerText.includes(crumb)) return;
        if(filetree[crumb].type === "file") {
          readFile(filetree[crumb].path);
          return;
        }

        listFiles(element, filetree[crumb]);
        updateParents = element.querySelectorAll("div");
        console.table(crumb, updateParents);
      });

      possibleParentElements = updateParents;
      console.log(crumb, possibleParentElements, updateParents);
    });
  }

  async function getGithubFiles(path) {
    let files = await fetch(
      `https://api.github.com/repos/e-seng/writeups/contents/${path}`,
      {
        method: "GET",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer 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",
        }
      },
    ).then(res => {return res.json()});

    return files;
  }

  async function readFile(filepath) {
    let body = await fetch(
      "https://raw.githubusercontent.com/e-seng/writeups/master/"+filepath,
    ).then(res => {return res.text()});

    filetype = getFiletype(filepath);

    if(filetype === "md") {
      let content = marked.parse(body);
      document.querySelector("#content").innerHTML = content;
      hljs.highlightAll();
      return;
    }

    let pre = document.createElement("pre");
    let code = document.createElement("code");

    code.classList.add("hljs")
    code.classList.add("language-"+filetype);
    code.innerHTML = hljs.highlight(
      body, {
      language: filetype,
    }).value;

    pre.appendChild(code);
    document.querySelector("#content").innerHTML = "";
    document.querySelector("#content").appendChild(pre);
  }

  function listFiles(parentElement, filesJson) {
    if(parentElement.classList.contains("loaded")) {
      parentElement.classList.toggle("opened");
      return;
    }

    let parentDirName = parentElement.querySelector("a").href;
    let listElement = parentElement.querySelector("ul");

    if(listElement === null) {
      listElement = document.createElement("ul");
      parentElement.appendChild(listElement);
    }

    console.log(filesJson);
    filesJson.forEach((file) => {
      switch(file.type) {
        case("dir"): // the file is a directory
          let directoryDiv = document.createElement("div");
          let directoryListing = document.createElement("li");
          let directoryLink = document.createElement("a");

          directoryLink.innerText = file.name + "/";
          directoryLink.href = parentDirName + "/" + file.name;

          directoryLink.addEventListener("click", async () => {
            let filesJson = await getGithubFiles(file.path);
            listFiles(directoryDiv, filesJson);
          });

          directoryListing.appendChild(directoryLink);
          directoryDiv.appendChild(directoryListing);
          listElement.appendChild(directoryDiv);
          break;
        case("file"): // the file has data
          // check filetype to avoid reading binary files
          if(!ALLOWED_FILETYPES.includes(getFiletype(file.name))) return;
          let fileDiv = document.createElement("div");
          let fileListing = document.createElement("li");
          let fileLink = document.createElement("a");

          fileLink.innerText = file.name
          fileLink.href = parentDirName + "/" + file.name;

          fileLink.addEventListener("click", async () => {
            readFile(file.path);
          });

          fileListing.appendChild(fileLink);
          fileDiv.appendChild(fileListing);
          listElement.appendChild(fileDiv);
          break;
      }
    });

    parentElement.classList.add("loaded");
    parentElement.classList.add("opened");
  }

  document.querySelector("#category-ctf > a").addEventListener("click", async () => {
    listFiles(
      document.querySelector("#category-ctf"), 
      await getGithubFiles("/"),
    );
  });

  document.querySelector("#category-notes > a").addEventListener("click", async () => {
    listFiles(
      document.querySelector("#category-notes"),
      await getGithubFiles("/"),
    );
  });

  // open current breadcrumb, if it's there
  if(window.location.href.indexOf('#') > -1) {
    openBreadcrumb();
    return;
  }

  // list CTF files
  listFiles(
    document.querySelector("#category-ctf"),
    await getGithubFiles("/")
  );

  /*/ list notes, commented as there currently are not any
  listFiles(document.querySelector("#category-notes"), "/");
  // */
});
