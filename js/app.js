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
            codeLine.innerHTML = highlightSyntax(codePart);

            document.querySelector("#code").appendChild(codeLine);
        });
    }

    var syntaxFlags = {
        "escapeChars" : {
            "pattern" : /[\/<>&"]/g,
            "replaceFunc" : function(flag, tag){
                let eqChar = {
                    "/" : "\/",
                    "<" : "&lt;",
                    ">" : "&gt;",
                    "&" : "&amp;",
                    "\"" : "&quot;"
                }

                return eqChar[tag];
            }
        },
        "tag" : {
            "pattern" : /[</]\w*[> ]/g,
            "replaceFunc" : function(flag, target){
                let targetItem = target.slice(1, -1);
                let finalTag = target.slice(0, 1) + 
                    `<span style="color: var(--html-${flag})">${targetItem}</span>`+
                    target.slice(-1);

                console.log(finalTag);
                return finalTag;
            }
        },
    }

    function highlightSyntax(htmlLine){
        let finalLine = htmlLine;
        let count = 0;
        // Check for html tags
        Object.keys(syntaxFlags).forEach(function(flag){
            if(!syntaxFlags[flag].pattern.test(finalLine)){return;}
            finalLine = finalLine.replaceAll(
                syntaxFlags[flag].pattern,
                function(target){
                    return syntaxFlags[flag].replaceFunc(target, flag);
                }
            );
            console.log(Object.keys(syntaxFlags));
        });

        return finalLine;
    }
    
    window["highlightSyntax"] = highlightSyntax;

    main();
}

window.addEventListener("load", function(){
    init();
});
