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

  async function getGithubFiles(user, repo, path) {
    let files = await fetch(
      `https://api.github.com/repos/${user}/${repo}/contents/${path}`,
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

  async function listFiles(parentElement, filepath) {
    let parentDirName = parentElement.querySelector("a").href;
    let listElement = parentElement.querySelector("ul");

    if(parentElement.classList.contains("loaded")) {
      parentElement.classList.toggle("opened");
      return;
    }

    let filesJson = await getGithubFiles("e-seng", "writeups", filepath);

    if(listElement === null) {
      listElement = document.createElement("ul");
      parentElement.appendChild(listElement);
    }

    filesJson.forEach((file) => {
      switch(file.type) {
        case("dir"): // the file is a directory
          let directoryDiv = document.createElement("div");
          let directoryListing = document.createElement("li");
          let directoryLink = document.createElement("a");

          directoryLink.innerText = file.name + "/";
          directoryLink.href = parentDirName + "/" + file.name;

          directoryLink.addEventListener("click", async () => {
            listFiles( directoryDiv, file.path,
            );
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

  // list CTF files
  document.querySelector("#category-ctf > a").addEventListener("click", () => {
    listFiles(document.querySelector("#category-ctf"), "/");
  });
  listFiles(document.querySelector("#category-ctf"), "/");

  /*/ list notes, commented as there currently are not any
  document.querySelector("#category-notes > a").addEventListener("click", () => {
    listFiles(document.querySelector("#category-notes"), "/");
  });
  listFiles(document.querySelector("#category-notes"), "/");
  // */
});
