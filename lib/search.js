/*
(c) Marco Boschi http://marcoboschi.altervista.org 2011 - 2019
*/
var home='/';
var showRes='PU'; //PU: box above the page, otherwise a CSS selector for the element where results will be displayedrisultati
var closeImg='https://speechindia.in/img/close.gif';
var wordExclude=['il','lo','la','i','gli','le','di','a','da','in','con','su','per','tra','fra','e','ma','però','invece','oppure','perchè','perché','del','dello','dell','della','degli','delle','al','allo','all','alla','agli','alle','dal','dallo','dall','dalla','dai','dagli','dalle','nel','nello','nell','nella','negli','nelle','col','coi','sul','sullo','sull','sulla','sui','sugli','sulle'];
/* DO NOT EDIT BEYOND THIS LINE */
var pages={};
var site_status=false;
var search=false;
var box;

var specialCharacterPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|\/\-="']/;


String.prototype.find=function(what){
return(this.indexOf(what)>=0 ? true : false);
}
String.prototype.count=function(p){
	n=0;
	i=0;
	while(this.indexOf(p, i)>=0) {
		n++;
		new_i=this.indexOf(p, i);
		i=new_i+p.length;
	}
	return n;
}
$(function(){
	var btn = $('#searchBox button').on('click', function(){
		search=$.trim($(this).parent().find('input').val());

		// console.log(search)

		if (specialCharacterPattern.test(search) || search.length > 20) {
			return;
		}

		createBox();
	})
	$('#searchBox input').on('keyup', function(e){
		if(e.keyCode == 13)
			btn.click()
	})
	//spider
	spider(home);
	site_status=true;
	if(search) showResult();
});
function scanLink(href, url){
	if(href=='') return '';
	href=href.split('/');
	if(href[0]=='http:' || href[0]=='https:' || href[0]=='ftp:' || href[0].split(':')[0]=='mailto' || href[0].split(':')[0]=='javascript') return '';
	if(href[0]=='') return href.join('/');
	path=url.split('#')[0].split('?')[0].split('/');
		if(path.length>1) path.splice(path.length-1,1);
		else path=['.'];
	path=path.join('/')+'/';
	return path+href.join('/');
}
function checkScan(source){
	r=0;
	$.each(pages, function(url, cont){
		if(cont['source']==source) r++;
	});
	return r==0 ? false : true;
}
function spider(url){
	if(pages[url] !== undefined)
		return

	$.ajax({
		url: url,
		dataType: 'text',
		async: true,
		complete: function(result){
			if(result.status!=200) return;
			head=result.getAllResponseHeaders().toLowerCase();
			if(!head.find('content-type: text/html')) return;
			res=result.responseText;
			if(checkScan(res)) return;
			tit_s=res.indexOf('<title>');
			tit_e=res.indexOf('</title>');
			if(tit_s<0) tit_s=res.indexOf('<TITLE>');
			if(tit_e<0) tit_e=res.indexOf('</TITLE>');
			tit='';
			if(tit_s>=0 && tit_e>=0) tit=res.substring(tit_s+7, tit_e);
			body_s=res.indexOf('<body');
			body_e=res.indexOf('</body>');
			if(body_s<0) body_s=res.indexOf('<BODY');
			if(body_e<0) body_e=res.indexOf('</BODY>');
			body=$(res.substring(body_s, body_e+7).toLowerCase());
			//look individual elements to find links
			pages[url]={'tit': tit, 'body': body, 'source': res, 'count': 0};
			body.each(function(i, el){
				el=$(el);
				el.find('a').each(function(i, a){
					a=$(a);
					if(a.attr('href')!='' && !a.hasClass('no_follow')){
						link=scanLink(a.attr('href'), url);
						if(link!='') spider(link);
					}
				});
				el.find('iframe').each(function(i, frm){
					frm=$(frm);
					if(frm.attr('src')!='' && !frm.hasClass('no_follow')){
						link=scanLink(frm.attr('src'), url);
						if(link!='') spider(link);
					}
				});
			});
		}
	});
}
function closeBox(){
	if(showRes=='PU' && box) { box.remove(); $('#overlay').remove(); box=null; }
}
function createBox(){
	if(!search) return;
	if(showRes=='PU') { closeBox(); $('body').append("<div id='overlay'></div>").find('#overlay').fadeTo(0, 0.5).click(function(){ closeBox(); }); }
	box=showRes=='PU' ? $('body').append("<div id='showRes' class='PU_showRes'></div>").find('#showRes') : $(showRes);
	box.addClass('showRes').empty();
	if(showRes=='PU') box.append("<img src='"+closeImg+"' alt='' style='float:right' onclick='closeBox()' />");
	box.append("<span class='titBoxRes'>Search results for : </span> "+search)
		.append("<hr /><div id='contRes'>Loading...</div>");
	if(site_status) showResult();
}
function showResult(){
	res={};
	tmp=search.toLowerCase().replace(/,/g, '').replace(/;/g, '').replace(/\./g, '').replace(/:/g, '').replace(/\!/g, '').replace(/\?/g, '').replace(/"/g, '').split(' ');
	search=[];
	$.each(tmp, function(i, el){
		$.each(el.split("'"), function(i, s){
			if(s!='' && $.inArray(s, wordExclude)<=0) search.push(s);
		});
	});
	//filter pages
	count=[];
	$.each(pages, function(url, p){
		pages[url]['count']=0;
		$.each(search, function(i, s){ pages[url]['count']+=pages[url]['tit'].count(s); });
		$.each(p['body'], function(i, el){
			$.each(search, function(i, s){ pages[url]['count']+=$(el).text().count(s); });
			$(el).find("*[title]").each(function (i, subel){
				$.each(search, function(i, s){ pages[url]['count']+=$(subel).attr('title').count(s); });
			});
			$(el).find("*[alt]").each(function (i, subel){
				$.each(search, function(i, s){ pages[url]['count']+=$(subel).attr('alt').count(s); });
			});
		});
		tot=pages[url]['count'];
		if($.inArray(tot, count)<0 && tot>0) count.push(tot);
	});
	count.sort(function(a,b){ return b-a; });
	//mostro le pagine
	show=$('#contRes');
	if(count.length==0) show.text("No results");
	else{
		show.empty();
		$.each(count, function(i, n){
			$.each(pages, function(url, p){
				if(p.count==n) show.append("<div class='res'><a href='"+url+"'>"+(p.tit!='' ? p.tit : "<i>Untitled page</i>")+"</a></div>");
			});
		});
	}
	search=false;
}
