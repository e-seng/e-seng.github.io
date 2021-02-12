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

            // Escape characters as necessary
            codePart = codePart.replaceAll(/[\/<>&"]/g, function(tag){
                let eqChar = {
                    "/" : "\/",
                    "<" : "&lt;",
                    ">" : "&gt;",
                    "&" : "&amp;",
                    "\"" : "&quot;"
                }

                return eqChar[tag];
            });

            codeLine.innerHTML = highlightSyntax(codePart);

            document.querySelector("#code").appendChild(codeLine);
        });
    }

    var syntaxFlags = {
        "attribute" : {
            "pattern" : / \w*=/g,
            "startCut" : 1,
            "endCut" : -1
        },
        "startTag" : {
            // "pattern" : /((&lt;)|[</])\w*((&gt;)|[> ])/g,
            "pattern" : /(&lt;)\w* /g,
            "startCut" : 4,
            "endCut" : -1
        },
        "endTag" : {
            "pattern" : /\/\w*(&gt;)/g,
            "startCut" : 1,
            "endCut" : -4
        },
        "tag" : {
            "pattern" : /(&lt;)\w*(&gt;)/g,
            "startCut" : 4,
            "endCut" : -4
        },
        "comment" : {
            "pattern" : /(&lt;!--)[\w ]*(--&gt);/g,
            "startCut" : 0,
            "endCut" : -1
        }
    }

    function syntaxFormat(target, flag, startCut, endCut){
        let targetItem = target.slice(startCut, endCut);
        let finalLine = target.slice(0, startCut);
        finalLine += `<span class="${flag}">${targetItem}</span>`
        finalLine += target.slice(endCut);

        console.log(finalLine, target, startCut, endCut);

        return finalLine;
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
                    return syntaxFormat(
                        target,
                        flag,
                        syntaxFlags[flag].startCut,
                        syntaxFlags[flag].endCut
                    );
                }
            );
            // console.log(finalLine);
        });

        return finalLine;
    }
    
    window["highlightSyntax"] = highlightSyntax;

    main();
}

window.addEventListener("load", function(){
    init();
});
