$(function(){
  var catPane = $(".categoryResult");
  var prodPane = $(".productResult");
  var vWidth = $(window).width();
  var vHeight = $(window).height();
  //custom appender 
  String.prototype.compose = (function (){
    var re = /\{{(.+?)\}}/g;
    return function (o){
            return this.replace(re, function (_, k){
                return typeof o[k] != 'undefined' ? o[k] : '';
            });
        }
  }());
  
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };
  var tblorder = $("#tblorder").children('tbody');
  var table = tblorder.length ? tblorder : $('#tblorder');
  //appender template
  var numCategory = 1;
  var item = '<tr id="row_{{id}}">'+
             '<td>{{name}}</td>'+
             '<td class="col-xs-3"><input type="number"'+ 
             'class="form-control" min="0" id="prod_{{id}}"/></td>'+
             '<td>{{price}}</td>'+
             '</tr>';
  var getCategoryPane = function() {
    $.get("/getCategories/2/all",function(data){
      catPane.empty();
      catPane.append(data);
      numCategory = Math.ceil($(".clickable_cat").length/6);
      addCategoryHandlers();
    });
  }

  $("#search_me").keyup(function(){
    var val = $("#search_me").val()
    if(!val){
      getProductPane();
    }else{
      //console.log("get")
      $.get("/getProducts/"+numBtn+"/"+currPage+"/bar/"+"s-"+$("#search_me").val(),function(data){
        $(".productList").empty();
        $(".productList").append(data);
        addProductHandlers();
      });
    }
  });

  var addCategoryHandlers = function() {
    $(".clickable_cat").click(function(){
      if($(this).attr('data-id')){
        var id = $.parseJSON($(this).attr('data-id'));
      }
      getMatchingSubCat(id);
      $.get("/getCategories/3/"+id,function(data){
        //3 to get children cats
        catPane.empty();
        catPane.append(data);
        $(".catRow").append('<div class="col-xs-2 col-sm-2 no-gutter">'+
          '<button id="backToMainCat" class="resultButton">Go back'+
          '</button></div>');
        if($(this).attr('data-id')){
          var id = $.parseJSON($(this).attr('data-id'));
        }
        addSubcategoryHandlers(id);
        $("#backToMainCat").click(function(){
          getCategoryPane();
          getProductPane();
        });
      });
    });
  }

  var addSubcategoryHandlers = function(){
    $(".clickable_cat").click(function(){
      if($(this).attr('data-id')){
        var id = $.parseJSON($(this).attr('data-id'));
      }
      getMatchingLeafCat(id);
    });
  }

  var getMatchingLeafCat = function(id){
    if(id){
      currPage = 0;
      $.get("/getProducts/"+numBtn+"/"+currPage+"/bar/"+id+"/yes",function(data){
        $(".productList").empty();
        $(".productList").append(data);
        addProductHandlers();
        if($("#nmPage").val() <= 1){
          $(".btnGroupNextPrev").remove();
        }
      });
    }
  }
  var getMatchingSubCat = function(id){
    if(id){
      currPage = 0;
      $.get("/getProducts/"+numBtn+"/"+currPage+"/bar/"+id,function(data){
        $(".productList").empty();
        $(".productList").append(data);
        addProductHandlers();
        if($("#nmPage").val() <= 1){
          $(".btnGroupNextPrev").remove();
        }
      });
    }
  }

  var order = [];
  var checkQuantity = function(c) {
    var count = 0;
    for(var i = 0;i<order.length;++i){
      if(order[i]['id'] == c['id']){
        count = order[i]['quantity'];
        break;
      }
    }
    if(!c.hasOwnProperty('quantity')){
      c['quantity'] = 0;
    }
    return count;
  }

  var updateQuantity = function(id,val){
    var q = 1;
    for(var i = 0;i<order.length;++i){
      if(order[i]['id'] == id){
        order[i]['quantity'] += 1;
        q = order[i]['quantity'];
        ////console.log("q " + q)
        break;
      }
    }
    $("#prod_"+id).val(q);
  }

  var setQuantity = function(id,val){
    for(var i = 0;i<order.length;++i){
      if(order[i]['id'] == id){
        order[i]['quantity'] = val;
        break;
      }
    }
    $("#prod_"+id).val(val);
  }

  var addToOrder = function(c){
    var quantity = checkQuantity(c);
    ////console.log(quantity)
    if(quantity == 0){
      table.append(item.compose({
        'name':c['name'],
        'id': c['id'],
        'price':c['price']
      }));
      $("#prod_"+c['id']).bind('keyup mouseup', function(e){
        var val = $("#prod_"+c['id']).val();
        if(val != 0){
          setQuantity(c['id'],Number(val));
        }else{
          clearorder(c['id'])
          $('#row_'+c['id']).remove();
        }
        updatePrice();
      });
      order.push(c);
      updateQuantity(c['id'],quantity)
    }else{
      updateQuantity(c['id'],quantity)
    }
    updatePrice();
  }

  var clearorder = function(id) {
    if(id){
      for(var i = 0;i<order.length;++i){
        if(order[i]['id'] == id){
          order.remove(i);
          break;
        }
      }
    }else{
      // remove everything
      for(var i = 0;i<order.length;++i){
        $('#row_'+order[i]['id']).remove();
      }
      order = [];
      clearTotals();
    }
  }

  var clearTotals = function(){
    $('#subtotal').text("$"+0.00);
    $('#tax').text("$"+0.00);
    $('#items').text(0);
  }

  var updatePrice = function(){
    var subtotal = 0;
    var tax = 0;
    var items = 0;

    for(var i = 0;i<order.length;++i){
      ////console.log(order[i]['price'] +" with "+order[i]['quantity'])
      subtotal += order[i]['price']*order[i]['quantity'];
      items += order[i]['quantity'];
        
    }
    tax = subtotal*0.13;
    subtotal += tax;
    $('#subtotal').text("$"+subtotal.toFixed(2));
    $('#tax').text("$"+tax.toFixed(2));
    $('#items').text(items);
  }

  var getCurrentTotal = function(){
    var subtotal = 0;
    for(var i = 0;i<order.length;++i){
      subtotal += order[i]['price']*order[i]['quantity'];
    }
    return subtotal*1.13;
  }
  var addProductHandlers = function() {
    $('.product').click(function(e){
        e.preventDefault();
        var el = $(this).data();
        addToOrder(el);
      });
  }
  var currPage = 0;
  var getProductPane = function() {
    $.get("/getProducts/"+numBtn+"/0",function(data){
      prodPane.empty();
      prodPane.append(data);
      addProductHandlers();
      var maxPage = $("#maxPageNum").val();
      $("#nextPage").click(function(){
        if(currPage+1 < maxPage){
          currPage++;
          $.get("/getProducts/"+numBtn+"/"+currPage+"/bar",function(data){
            $(".productList").empty();
            $(".productList").append(data);
            addProductHandlers();
          });
        }
      });
      $("#prevPage").click(function(){
        //console.log(currPage)
        if(currPage - 1 >= 0){
          currPage--;
          $.get("/getProducts/"+numBtn+"/"+currPage+"/bar",function(data){
            $(".productList").empty();
            $(".productList").append(data);
            addProductHandlers();
          });
        }
      });
    });
  }
  var numBtn = Math.floor((vHeight - 120 - 75)/75);
  ////console.log(Math.floor((vHeight - 120)/75))
  ////console.log(numCategory)

  getCategoryPane();
  getProductPane();
  $("#btnPurchase").click(function(e){
    $('#checkoutModal')
        .prop('class', 'modal fade') // revert to default
        .addClass( $(this).data('direction') );
  $('#checkoutModal').modal({
    keyboard: true,
    show:false
    }).on('shown.bs.modal',function(e){ 
      var totalcost = getCurrentTotal();
      var tender = $("#c_tender");
      $('#the_total').text("$"+totalcost.toFixed(2));
      tender.keyup(function(){
        if(tender.val() >= totalcost && totalcost != 0){
          $('#btnFinalize').removeAttr('disabled','disabled');
          $('#c_change').text((Number(tender.val()) - totalcost).toFixed(2));
        }else{
          $('#btnFinalize').attr('disabled','disabled');
        }
      });
      $("#btnFinalize").unbind().bind('click',function(){
        e.preventDefault();
        ////console.log(JSON.stringify(order))
        //console.log("ajax finalize !")
        if(order.length > 0){
          $.ajax({
            type: 'POST',
            url: '/checkout',
            data: JSON.stringify(order),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(res) {
              //console.log(res);
              if (res['data'] == 'successful') {
                $("#c_change").text("");
                $("#c_tender").val("");
                $("#checkoutModal").modal('toggle');
                clearorder();
              }
              else {
                alert("Something terrible happened while saving");
              } 
            }
          });
        }
        e.stopPropagation();
        return false;
      });
    });
  });
});