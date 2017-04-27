$(function(){
    for (var i = 0; i < localStorage.length; i++){
        var order = localStorage.getItem(localStorage.key(i));
        $('#cart').append(order +"<br>");
    }
});