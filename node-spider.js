/**
 * Created by wangxiaobo on 17/2/13.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0 ;
var url = "http://news.163.com/world/";

function fetchPage(x){
    startRequest(x);
}

function startRequest(x){
    //采用http模块向服务器发起一次get请求
    http.get(x,function (res){
        var html = ''; //用来存储请求网页的整个html内容
        var titles = [];
        res.setEncoding('utf-8');//规定utf-8模式,防止乱码
        //监听data事件,每次取一次数据
        res.on('data',function (chunk){
            html +=chunk;
        });
        //监听end事件,如果整个网页内容的html都获取完毕,就执行回调函数
        res.on('end',function (){
            //一个微不足道的小规则
            var $ = cheerio.load(html);//采用cheerio模块解析html
            var time = $('div.data_row span.time').text().trim();
            var news_item = {
                //获取文章标题
                title: $('div.news_title h3 a').text().trim(),
                //获取文章发布的时间
                Time: time,
                //获取当前文章的url
                link: $("div.news_title h3 a").attr('href'),
                //获取供稿单位
                //author: $('[title=供稿]').text().trim(),
                //i是用来判断获取了多少篇文章
                i: i = i + 1,
            };
            console.log(news_item,"*");//log新闻信息
            var news_title = $('div.news_title h3 a').text().trim();
            console.log(news_title,"**")
            savedContent($,news_title);  //存储每篇文章的内容及文章标题
            savedImg($,news_title);    //存储每篇文章的图片及图片标题
            //下一片文章的url
            //var nextLink="http://www.ss.pku.edu.cn" + $("li.next a").attr('href'),
            //str1 = nextLink.split('-'),  //去除掉url后面的中文
            //str = encodeURI(str1[0]);
            //这是亮点之一，通过控制I,可以控制爬取多少篇文章.
            //if (i <= 500) {
            //    fetchPage(str);
            //}
        });
    }).on('error',function (err){
        console.log(err)
    });
}

//该函数作用:在本地存储所爬去的新闻内容资源
function savedContent($,news_title){
    $('.article-content p').each(function (index, item){
        var x = $(this).text();
        var y = x.substring(0,2).trim();
        if(y == ''){
            x=x+'\n';
            //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
            fs.appendFile('./data/'+news_title + '.txt',x,'utf-8',function (err){
                if(err){
                    console.log(err);
                }
            })
        }
    })
}

//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($,news_title){
    $('.na_pic img').each(function (index, item) {
        var img_title = $(this).attr('alt');  //获取图片的标题
        if(img_title.length>35||img_title==""){
            img_title="Null";}
        var img_filename = img_title + '.jpg';

        var img_src = $(this).attr('src'); //获取图片的url

//采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/'+news_title + '---' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
    })
}

fetchPage(url);      //主程序开始运行