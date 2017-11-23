var express = require('express');
var router = express.Router();
var mysql=require('./mysql');
var multer=require('multer');
var xlsx=require('node-xlsx');


var storage = multer.diskStorage({
    /*设置文件的路径   必须自己手动创建文件夹*/
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    /*设置文件名字*/
    filename: function (req, file, cb) {
        cb(null, new Date().getTime()+file.originalname)
    }
})

var upload = multer({ storage: storage })

// mysql.connect();
/* GET users listing. */
router.get('/', function(req, res, next){
    res.render('users');
});
/*动态取数据*/
router.post('/ajax',function (req,res,next){
    var page=req.body.page;
    var num=10;
    var nums=page*num;
    mysql.query("select *,year(date_format(NOW(),'%Y-%m-%d'))-year(sage) as sages,case ssex when 0 then '女' else '男' end as sexs from stu limit "+nums+" , "+num,function (err,result) {
        if(err){
            console.log(err);
            req.end();
        }else {
            // console.log(result);
            res.render('ajax',{data: result });
        }
    })
})
router.get('/add',function (req,res,next){
    res.render('add');
})
router.get('/addCon',function (req,res,next){
    /*接收数据*/
    var sname=req.query.sname;
    var sage=req.query.sage;
    var ssex=req.query.ssex;
    mysql.query(`insert into stu(sname,sage,ssex) values ("${sname}","${sage}",${ssex})`,function(err,result){
      if(err){
        console.log(err);
        res.end();
      }else {
        if(result.affectedRows>0){
          res.render("add");
        }
        res.end();
      }
    })
})

/*删除*/
router.get('/del/:sid',function (req,res,next) {
    let sid=req.params.sid;
    mysql.query("delete from stu where sid="+sid,function (err,result) {
        if(err){
          console.log(err);
          res.end();
        }else{
          if(result.affectedRows>0){
            // res.redirect('/users');
            res.send("<script>alert('删除成功');location.href='/users'</script>")
          }
        }
    })
})

/*编辑*/
router.get('/edit/:sid',function (req,res,next) {
  let sid =req.params.sid;
  mysql.query('select * from stu where sid='+sid,function (err,result) {
      if(err){
        console.log(err);
        res.end();
      }else {
        res.render('edit',{data:result});
        res.end();
      }
  })

})
/*编辑内容*/
router.post('/editCon/:sid',function (req,res,next){
    let sid=req.params.sid;
    let sname=req.body.sname;
    let sage=req.body.sage;
    let ssex=req.body.ssex;
    mysql.query(`update stu set sname="${sname}",sage="${sage}",ssex=${ssex} where sid=`+sid,function (err,result) {
        if(err){
          console.log(err);
          res.end();
        }else {
            if(result.affectedRows>0){
                // res.redirect('/users');
                res.send("<script>alert('更新成功');location.href='/users'</script>")
            }
        }
    })

})

/*上传文件界面*/
router.get('/upload',function (req,res,next) {
    res.render('upload');
})

/*上传文件*/
router.post('/uploadCon',upload.single('file'),function (req,res,next) {
    /*req.file 里面存放文件信息*/
    var excelPath=req.file.path;
    /*获取文件里面的数据  可以解析excel文件
    *
    * [{name:表名,data:[[],[]]},
    *  {name:表名,data:[[],[]]}
    *
    * ]
    *
    * */
    var info=xlsx.parse(excelPath);
    var datas=info[0].data;
    var arr=[];
    for(var i=1;i<datas.length;i++){
        datas[i][2]=new Date(1900,0,datas[i][2]).toLocaleDateString();
        if(datas[i][1]=="男"){
            datas[i][1]=1;
        }else if(datas[i][1]=="女"){
            datas[i][1]=0;
        }
        arr.push(datas[i]);
    }
    // console.log(arr);
    mysql.query("insert into stu (sname,ssex,sage) values ? ",[arr],function (err,result) {
        if(err){
            console.log(err);
            res.end();
        }else{
            res.redirect('/users');
        }
    })

})
module.exports = router;
