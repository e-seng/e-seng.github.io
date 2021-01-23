function init(){
    console.log("hello")
    
    function main(){
        populateSquare();
    }

    function populateSquare(){
        let pageHtml = document.querySelector("html").cloneNode(true);
        let codeBlock = pageHtml.querySelector("#code")
        codeBlock.parentNode.removeChild(codeBlock);

        let code = "";

        pageHtml.outerHTML.split("\n").forEach(function(codePart){
            let indent = 0;

            while(/    /.test(codePart)){
                codePart = codePart.replace("    ", "");
                indent++;
            }
            
            let codeLine = document.createElement("pre");
            codeLine.setAttribute("style", `text-indent: ${indent}rem`);
            codeLine.innerText = codePart;

            document.querySelector("#code").appendChild(codeLine);
        });
    }

    main();
}

window.addEventListener("load", () => init());
