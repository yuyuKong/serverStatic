$(function () {
    let page=0;
    $.ajax({
        url:'/users/ajax',
        type:'post',
        data:{page},
        success:function (e){
            $(e).appendTo("tbody");
        }
    })
    page++;
    var flage=true;
    $(window).scroll(function(){
        if($(window).height()+$(window).scrollTop()+10>$('body').outerHeight()){
            if(!flage){
                return;
            }
            flage=false;
            $.ajax({
                url:'/users/ajax',
                type:'post',
                data:{page},
                success:function (e){
                    page++;
                    $(e).appendTo("tbody");
                    flage=true;
                    if($('tr:last-of-type>td').html()=="没有更多内容了..."){
                        flage=false;
                    }else {
                        flage=true;
                    }
                }
            })
        }
    })
})