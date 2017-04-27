$(function(){
    for (var i = 0; i < localStorage.length; i++){
        var div = document.createElement("div");
        div.className = "order col-xs-3";
        var key = localStorage.key(i);
        var order = localStorage.getItem(localStorage.key(i));
        order = JSON.parse(order);
        div.id = key;
        
        for(var x = 0; x< order.length;x++){
            
            var arr = order[x];
            
            arr["key"+key]=key;
            name = arr['name'];
            if(arr['instruction']) ins = '--'+arr['instruction'];
            else ins = "";
            div.innerHTML += name + ' <br> '+ ins +'<br>';
        }
        
        var delbtn = document.createElement("BUTTON");
        delbtn.className = "deleteBTN btn btn-danger";
        delbtn.innerHTML = "Done";
    
        delbtn.onclick = function(){
            localStorage.removeItem(this.parentNode.id);
            this.parentNode.parentNode.removeChild(this.parentNode);
            
            
        };
        
        div.appendChild(delbtn);
        $('#cart').prepend(div);
    }
});