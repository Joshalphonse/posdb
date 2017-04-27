$(function(){
    for (var i = 0; i < localStorage.length; i++){
        var div = document.createElement("div");
        div.className = "order col-xs-3";
       
        var order = localStorage.getItem(localStorage.key(i));
        order = JSON.parse(order);
        
        for(var x = 0; x< order.length;x++){
            var arr = order[x];
            name = arr['name'];
            if(arr['instruction']) ins = '--'+arr['instruction'];
            else ins = "";
            div.innerHTML += name + ' <br> '+ ins +'<br>';
        }
        
        var delbtn = document.createElement("BUTTON");
        delbtn.className = "deleteBTN btn btn-danger";
        delbtn.innerHTML = "Done";
        delbtn.addEventListener("click", function(){
            this.parentNode.parentNode.removeChild(this.parentNode);
            localStorage.removeItem(localStorage.key(i));
        });
        
        div.appendChild(delbtn);
        $('#cart').prepend(div);
    }
});