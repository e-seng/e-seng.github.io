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
        }
      },
    ).then(res => {return res.json()});

    return files;
  }

  async function readFile(filepath) {
    let body = await fetch(
      "https://raw.githubusercontent.com/e-seng/writeups/master/"+filepath,
    ).then(res => {
      if(res.ok) return res.text();
      // otherwise, there was an error.
      alert(`err ${res.status}: there was an issue interacting with the github API. if it's 403, the rate limit has been reached and I push a token on to my repo :p sorry about any inconvenience`);
    });

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
            if(directoryDiv.classList.contains("loaded")) {
              directoryDiv.classList.toggle("opened");
              return;
            }

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

  // check screen width to see whether the mobile view should be enabled
  // stolen from
  // https://stackoverflow.com/questions/36532307/rem-px-in-javascript :)
  function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  console.log(window.screen.width, window.screen.availWidth, convertRemToPixels(60));
  if(window.screen.width <= convertRemToPixels(40)) {
    document.querySelector("#blog-container").classList.add("mobile");
    document.querySelector("#profile").addEventListener("click", () => {
      document.querySelector("#sidebar").classList.toggle("opened");
    });
  }

  // open current breadcrumb, if it's there
  if(window.location.href.indexOf('#') > -1) {
    openBreadcrumb();
    return;
  }
});
