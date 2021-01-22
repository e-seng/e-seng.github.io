function init(){
    console.log("hello")
    
    function main(){
        populateSquare();
    }

    function populateSquare(){
        let pageHtml = document.querySelector("html").cloneNode(true);
        let codeBlock = pageHtml.querySelector("#code");
    
        codeBlock.parentNode.removeChild(codeBlock);

        document.querySelector("#code").appendChild(pageHtml);
    }

    main();
}

window.addEventListener("load", () => init());
