function f(){

    function showLinks(){
        var links = document.querySelector("#links");
        links.classList.remove("hidden");
    }

    // main
    showLinks();
}

window.addEventListener("load", () => f());
