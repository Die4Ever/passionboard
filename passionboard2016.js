/* TODO
-HIGHLIGHT THE #PREDICTION POSTS FROM THE 2015 WCS WARS TOP 16!!!!
-show the top 5/10 most passionate posts
-combine the player keywords? I feel like they're not worth the characters

x-show images
x-group score for countries, favorite teams, and member joined years? favorite player based on sig?
    -race based on icon?
-improve graph
    -labels
    -test it's accuracy better, should it show multiple Y values for any single X value?
    -using different characters better?
    -trim the graph to last 48 hours? make another graph for all time?
-explanation text
-maybe shorten summaries to make it fit better in the character limit if I need to
-make #GivePoints work
-choose a selected topic at random
    -when reading posts the passionboard will remember what the last passionboard said the topic was and give extra points until it finds the next passionboard?
    -maybe would be more fair if the topics were timed instead of based on the randomish passionboard timings?
        -countdown until next topic starts and ends?
x-I need to make sure OutputStats correctly sorts everything so I can support multiple threads with intertwined posts
x-give a favorite team and/or player to each group of users? like countries have a favorite team and player, teams have a favorite player, players have a favorite team?
-list of recent videos and other links


-graph(s)
    -maybe change the graphing to where it builds an accumulative height_map, and then writes to arr, and then moves on to the next line?
-leaderboard
-hot tags
-highlighted tags show recent replies
try to compile a list of most quoted posts as highlights? self quoting doesn't count, try to count chains though?
try to list out long conversations based on quote chains?
hash tag player names? hash tag anything? hashtags are required to be counted? must hashtag players? or I can do playernames without hashtags? no because of the damn generic names like Classic and Dream T_T
link to previous passion board post
I want some graphs, even if they're just ASCII, i guess use the small tag and code tag to help with resolution and accuracy
don't count regular posts for passion
OP post would have the last X pictures and top X conversations and stuff, the post at the end of the thread would just have things since the last leaderboard post?
highlight the best posts, and best conversations?
put everything inside a quote tag so that it's automatically spoilered when people quote the posts
only count 1 post per user for each page or a span of 10 posts or something? a span of 10 posts or 10 minutes?
highlight TL+ awardings?
highlighted hashtags? player names, dustinbrowder, davidkim, protoss, terran, zerg, lyrics, pic, oc, video, sigbet, prediction, fanfic, casters, teams, countries? vod, giftpoints
the problem with since_last is that it could skip things since it doesn't instantly process and post...maybe I should tag each post with the last post it processed? that gets really complicated though
if I can detect polls then I can determine when games end
I should use tags for community-co-op-made fanfics, like #coopfanfic1 or something

I should change the way I do posts_indexed, should be like posts_indexed[index]=[{},{}]; and use get and set functions to make it easy
-use username and timestamp for the index, summary to resolve conflicts maybe by looking for word matches or hashtags
should indexed posts have an array of parents or is just a single parent fine?
tags apply to the whole conversation?
show favorite tags for users
*/

/*(function(){
  var newscript = document.createElement('script');
     newscript.type = 'text/javascript';
     newscript.async = true;
     newscript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js';
  (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(newscript);
})();*/


var names = {};
if(window.hasOwnProperty('tempnames')) names=tempnames;

//var namesa=[];
var counter=0;

var images={since_last:[],recents:[],posts:[]};
var golds={since_last:[],recents:[],posts:[]};
var tags = {};
var wcswarstop16 = {};
var teams = { 0: 'None', 265: 'Axiom Gaming', 9: 'CJ Entus', 295: 'CM Storm', 66: 'Complexity Gaming', 318: 'Dead Pixels', 24: 'Evil Geniuses', 320: 'Invasion eSport', 228: 'Invictus Gaming', 297: 'Jin Air Green Wings', 2: 'KT Rolster', 60: 'Millenium', 107: 'Most Valuable Player', 283: 'mYinsanity', 68: 'Prime', 57: 'ROOT Gaming', 10: 'Samsung Galaxy KHAN', 74: 'SBENU (StarTale)', 1: 'SK Telecom T1', 187: 'Team Acer', 65: 'Team Dignitas', 32: 'Team Liquid', 296: 'Team Property', 309: 'Team ROCCAT', 154: 'Wayi Spider', 150: 'Yoe Flash Wolves' };
for (var i = 0; i < 500; i++) {
    if(!teams.hasOwnProperty(i)) teams[i] = '[img]/images/starcraft/teams/'+i+'.png[/img] ('+i+')';
}
//var highlighted_tags = ['#davidkim','#dustinbrowder','#protoss','#terran','#zerg','#bet','#prediction','#lyrics','#fanfic','#coopfanfic','#blizzcon','#giftpoints'];//#10 is just for testing
var relevant_players = ['ShoWTimE','Elazer','Dark','Neeblet','TY','ByuN','Zest','Stats'];
var o_relevant_players = {};
for (var i = 0; i < relevant_players.length; i++) {
    o_relevant_players[relevant_players[i].toLowerCase()] = relevant_players[i];
}
var highlighted_tags = ['Neeb', 'Protoss', 'Terran', 'Zerg', 'Blizzcon', 'WCS', '#IMadeThis', 'Prediction', 'Predictions', '#GiftPoints', 'SigBet', 'SigBets', 'PassionBet', 'PassionBets'];
highlighted_tags = relevant_players.concat(highlighted_tags);
var o_highlighted_tags = {};
for(var i=0;i<highlighted_tags.length;i++) {
    o_highlighted_tags[highlighted_tags[i].toLowerCase()] = highlighted_tags[i];
}
//var convos={};
var posts_indexed={};

var links = { 'http://www.teamliquid.net/tlpd/images/Ticon_small.png': 0, 'http://www.teamliquid.net/tlpd/images/Picon_small.png': 0, 'http://www.teamliquid.net/tlpd/images/Zicon_small.png': 0, 'http://www.teamliquid.net/tlpd/images/Ricon_small.png': 0 };
var words={};
var commonwords={'and':1,'that':1,'you':1,'for':1,'but':1,'this':1,'was':1,'have':1,'not':1,'just':1,'with':1,'are':1,'like':1,"i'm":1,'will':1,'all':1,'one':1,'his':1,"it's":1,'get':1,'can':1,"don't":1,'what':1};
var invalids = { 26140889: 1, 26140891: 1 };
var point_giftings = {since_last:[],recents:[],posts:[]};
var prevuser='';
var lastpassionboard = '';
var timeslices = [];
var last_seconds_ago = 0;
//if(links.length==0) RunStats();

var tbody=$($('body').html());
//RunStats();

var urls = ['http://www.teamliquid.net/forum/sc2-tournaments/515809-blizzcon-2016-wcs-global-finals'];
var pages=[];

function CountPages(slot)
{
	var url=urls[slot];
	$.ajax({url:url, success:function(data){
		var p=1;
		var links = $(data).find('tr.thread_dock.top div.pagination *');
		console.log(url, $(data).find('tr.thread_dock.top'));
		$(links).each(function () {
			//if ($(this).text().match(/All/)) all = true;
			try {
				var i=parseInt($(this).text());
				if(i>p) p=i;
			} catch(e) {}//catch for Next and Prev I guess
		});
		pages[slot] = p;
		if (1) {//do All
		    urls[slot] = urls[slot] + '?view=all&'
		    pages[slot] = Math.ceil(p / 100);
		} else urls[slot] = urls[slot] + '?';

		if(slot+1<urls.length) CountPages(slot+1);
		else {
			ReadPage(1, 0, function() { OutputStats(); console.log('\nDONE!\n'); } );
		}
	}});
}

function CheckLinks()
{
	//var links = $('body > #navwrapper:nth-child(1) #main-content > table:nth-child(2) tbody tr:nth-child(1) td:nth-child(2) a:not([title^="Next Page"]):not([rel="nofollow"])');
    //var links = $('body > #navwrapper:nth-child(1) #main-content > table > tbody > tr > td[align="right"] a:not([title^="Next Page"]):not([rel="nofollow"])[href*="page="]');
    //var links = $('body tr.thread_dock.top div.pagination *');
	/*if(links.length==0) {
		console.log('no links found!');
		OutputStats();
		return;
	}*///no links is ok, just means 1 page
	
	/*var pages=1;
	$(links).each(function () {
	    //if ($(this).text().match(/All/)) all = true;
	    try {
	        var i=parseInt($(this).text());
	        if(i>pages) pages=i;
	    } catch(e) {}//catch for Next and Prev I guess
	});
	var all = false;
	if (window.location.href.match(/view=all/)) all = true;
	var base_url=window.location.href;*/
	
	CountPages(0);
	return;
	
	base_url = base_url.replace(/\?.*/, '');
	base_url += '?';
	if (all) {
	    base_url += 'view=all&';
	    console.log('running local');
	    tbody = $('html');
	    RunStats(0);
	    OutputStats();
	    console.log('DONE!');
	    return;
	}
	console.log(pages, base_url);
    //use a callback so I can string together multiple threads, clear last_seconds_ago when switching threads
	ReadPage(1, pages, base_url, function () { last_seconds_ago = 0; OutputStats(); console.log('\nDONE!\n'); });
}
CheckLinks();
counter=0;

function ReadPage(p, slot, callback)
{
	var base_url=urls[slot];
	var url = base_url;//+'page='+p;
	if (p > 1) url += 'page=' + p;
	/*if(pages[slot]<100) {//fix this to work with more "All" pages
		url=base_url+'?view=all';
		p = pages[slot] + 1;
	}*/
	console.log(url);
	$.ajax({url:url, success:function(data) {
		tbody=$(data);
		RunStats(0);
		if(p<pages[slot]) ReadPage(p+1, slot, callback);
		else if(slot+1<urls.length) {
			last_seconds_ago=0;
			ReadPage(1, slot+1, callback);
		}
		else {
		    callback();
		}
	}});
}


function ReadPageOld(p, pages, base_url, callback)
{
	var url=base_url+'page='+p;
	console.log(url);
	$.ajax({url:url, success:function(data) {
		tbody=$(data);
		RunStats(0);
		if(p<pages && p<500) ReadPage(p+1, pages, base_url, callback);
		else {
		    callback();
		}
	}});
}

function MakeContentType()
{
	return {posts:0,pics:0,videos:0,tags:0,convos:0};
}

function MakeUser(name, country, favteam, favplayer, joined_year)
{
    if (!country) country = '';
    if (!favteam) favteam = 0;
    if (!favplayer) favplayer = '';
    if (!joined_year) joined_year = 0;
	return {name:name,score:0,recentscore:0,country:country,favteam:favteam,favplayer:favplayer,joined_year:joined_year,lastdate:0,spam:0,types:{ normal:MakeContentType(),oc:MakeContentType(),recentnormal:MakeContentType(),recentoc:MakeContentType() }};
}

function AddToTimeslice(user, country, date, hours_ago, post, postlink, favteam, postscore)
{
    var slice_size = 1000 * 300;
    var start_timestamp = Math.floor(date.getTime() / slice_size) * slice_size;
    var slot = Math.floor(date.getTime() / slice_size);
    if (timeslices.length > 0) {
        slot -= timeslices[0].timestamp / slice_size;
    }
    if (timeslices.length == 0) {
        timeslices.push({ timestamp: start_timestamp, posts: 0, points: 0 });
        slot = 0;
    }
    else if (timeslices.length <= slot) {
        var gap_slices = (slot+1) - timeslices.length; //start_timestamp / slice_size - timeslices[timeslices.length - 1].timestamp / slice_size;
        for (gap_slices--; gap_slices >= 0; gap_slices--) timeslices.push({ timestamp: start_timestamp-gap_slices*slice_size, posts: 0, points: 0 });
    }
    timeslices[slot].posts++;
    timeslices[slot].points += postscore;
}

function CountWords(user, date, hours_ago, post, postlink, favteam, posttext)
{
	var m=posttext.match(/[\w\n\-\'#]{2,}/g);
	var lastword='';
	for(var i in m) {
		var w=m[i].toLowerCase();
		//w=user+': '+w;
		if(w.length==2 && w!='mc') continue;
		if(commonwords[w]==1) continue;
		//if(lastword=='drinking' && w=='game') console.log(postlink);
		if(!words[w]) words[w]={word:m[i],hits:0};
		words[w].hits++;
		lastword=w;
	}
}

function CheckMakeTag(tag)
{
	if(tags.hasOwnProperty(tag)) return;
	tags[tag] = { since_last: [], recents: [], posts: [], score: 0, recentscore: 0 };
	//console.log('added tag ' + tag);
}

function AddPostToObj(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, obj)
{
	var p={user:user,link:postlink,summary:summary,date:date};
	if(recent) obj.recents.push(p);
	obj.posts.push(p);
	if(hours_ago<50) obj.since_last.push(p);
}

function CountTags(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary)
{
    //console.log('counting tags for ' + JSON.stringify(arguments));

    var mytags = {};
    var a_mytags = [];
	var tag='';
	var m = posttext.match(/(\#?[\w\-\_\']{2,50})/g);
	if(m && m.length>0) {
		tag=m[0];
	} else { m = []; }
	m=m.concat(posttext.match(/([\w\-\_\']{2,50} [\w\-\_\']{2,50})/g));
	for (var t in m) {
	    if (!t) continue;
		if(!m.hasOwnProperty(t)) continue;
		tag = m[t];
		if (!tag) continue;
		//if (tag == 'jin air') console.log(tag);
		//if(tag=='#prediction') console.log(tag);
		tag = tag.replace(' ', '');
		//if (o_relevant_players[tag.toLowerCase()] && o_relevant_players[tag.toLowerCase()] != tag) continue;//case sensitive player names
		tag = tag.toLowerCase();
		//if(tag.match(/^\#/)) console.log(tag);
		if (!tag.match(/^\#/) && !o_highlighted_tags.hasOwnProperty(tag)) continue;
		if (mytags.hasOwnProperty(tag)) continue;
		mytags[tag] = 1;
		CheckMakeTag(tag);
		AddPostToObj(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, tags[tag]);
		//if (tag != m[t].toLowerCase()) console.log(m[t],tag);
		a_mytags.push(m[t]);
	}
	return a_mytags;
}

function TrimText(text)
{
	var ret=text.replace(/\s+/g,' ');
	ret=ret.replace(/(^\s+)|(\s+$)/g, '');
	return ret;
}

function StringHash(s)
{
	//return s;
	var r=s.length;
	for(i=0;i<s.length;i++) r+=s.charCodeAt(i)*3*(i+1);
	return r;
}

function SummarizeText(text, maxlen)
{
	var ret=TrimText(text);
	ret=ret.replace(/https?\:\/\/(www.)?/, '');
	if(ret.length>=maxlen-2) ret=ret.substr(0,maxlen-5)+'...';
	return ret;
}

function CalcPostIndex(user, date, summary)
{
    var index = user + ':' + date.toLocaleString().replace(/(\s+)|(:\d{2} \w{2}$)/g, '')+':'+StringHash(SummarizeText(summary,10));//ugh stupid inaccurate timestamps
    //var index = user + ':' + StringHash(SummarizeText(summary, 40));
	return index;
}

function CheckConversation(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, quotes)
{
	if(quotes.length==0) return;
	
	var subquotes = quotes.find('>.quote');
	quotes.find('>.quote').remove();
	var my_index=CalcPostIndex(user, date, summary);
	
	$(quotes).each(function(){
		var top = $(this).find('>b:contains("On "):contains(" wrote:"), >div[style="display: none;"] > b:contains("On "):contains(" wrote:")').text();
		top=TrimText(top);
		var quotetext=$(this).text();
		quotetext=quotetext.replace(top, '');
		quotetext=quotetext.replace(/\s+/g,' ');
		quotetext=quotetext.replace(/(^\s+)|(\s+$)/g, '');
		var quotesummary=SummarizeText(quotetext,150);
		//var quotesummaryshort=SummarizeText(quotetext,100);
		var m=top.match(/^On ([A-Z][a-z]+ \d{2} \d{4} \d{2}\:\d{2}) (.+?) wrote\:/);
		if (!m || m.length < 3) return;//console.log(top+' == '+JSON.stringify(m) );
		var datetext=m[1];
		var quoted_user=m[2];
		var pdate = new Date(new Date(datetext) - 3600 * 1000 * 14);
		if (pdate > new Date('11/1/2015 2:00 AM')) pdate = new Date(new Date(datetext) - 3600 * 1000 * 15);
		//var pdate=new Date(new Date(datetext)-3600*1000*13);
		
		var index=CalcPostIndex(quoted_user, pdate, quotesummary);
		if(!posts_indexed.hasOwnProperty(index)) {/*console.log('wtf, couldn\'t find index '+index);*/return; }
		if(!posts_indexed.hasOwnProperty(my_index)) {/*console.log('wtf, couldn\'t find my_index '+my_index);*/return; }
		//if(quotesummary!=posts_indexed[index].summary) {console.log('summary doesn\'t match '+index); return; }
		posts_indexed[index].children.push(my_index);
		posts_indexed[my_index].ancestors++;
		posts_indexed[my_index].parent=index;
		while(index.length>0) {
			posts_indexed[index].descendants++;
			posts_indexed[index].last_reply=date;
			index=posts_indexed[index].parent;
		}
	});
}

function ProcessPost(user, country, date, hours_ago, post, postlink, favteam, favplayer, joined_year)
{
    //console.log(JSON.stringify(arguments));

    if (!names[user]) names[user] = MakeUser(user, country, favteam, favplayer, joined_year);
    var n = names[user];
	
	var quotes = post.find('>.quote');
	post.find('.quote').remove();
	var scripts = post.find('script');
	post.find('script').remove();
	
	var posttext = TrimText(post.text());
	var summary = SummarizeText(posttext, 500);

	var recent = false;
	if (hours_ago < 24) recent = true;

	var index = CalcPostIndex(user, date, summary);
	posts_indexed[index] = { link: postlink, summary: summary, user: user, date: date, last_reply: date, children: [], ancestors: 0, descendants: 0, parent: '', score: 0 };
    try {
        CheckConversation(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, quotes);
    } catch (e) {
        console.log(e);
    }

    if (invalids[postlink]) return;

    if ((user == 'Die4Ever' && posttext.match(/^\s*\#PASSIONBOARD4EVER/)) || postlink == 25052230) {//maybe I should take out the ^ so it matches anywhere?
		lastpassionboard=postlink;
		//clear all since_last lists...
		images.since_last=[];
		golds.since_last=[];
		point_giftings.since_last=[];
		for(var i in tags) {
			tags[i].since_last=[];
		}
		/*for(var i in convos) {
			convos[i].since_last=[];
		}*/
		return;
	}
	
	var postscore=0;

	var mytags = CountTags(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary);
	for (var t = 0; t < mytags.length; t++) {
	    if (o_highlighted_tags.hasOwnProperty(mytags[t].toLowerCase())) {
	        postscore += posttext.length / 10 + 1;
	        t = mytags.length + 10;
	        break;
	    }
	}

	if(post.parents('section').find('header.plus1').length>0) {
		AddPostToObj(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, golds);
		postscore+=10;
	}
	if( posttext.match(/#GiftPoints (\d+) points to (\w+)/i)) {
		AddPostToObj(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, summary, point_giftings);
		var last = point_giftings.posts.length-1;
		var m = posttext.match(/#GiftPoints (\d+) points to (\w+)/i);
		var givepoints=parseInt(m[1]);
		var giveto=m[2];
		point_giftings.posts[last].givepoints=givepoints;
		point_giftings.posts[last].touser=giveto;
		if(n.score>=givepoints && user!=giveto && names.hasOwnProperty(giveto)) {
			n.score-=givepoints;
			names[giveto].score+=givepoints;
			console.log(user+' gave '+givepoints+' points to '+giveto);
		}
	}

	var chars=posttext.length;
	var pics=post.find('img[src^="http"]');
	var numpics=0;
	pics.each(function(){
		var src=$(this).attr('src');
		if( links.hasOwnProperty(src) ) {
			links[src]++;
			//return;
		} else {
		    //if (src.match(/teamliquid\.net/g)) return;
			links[src]=1;
			numpics++;
			AddPostToObj(user, country, date, hours_ago, post, postlink, favteam, posttext, recent, src, images);
			postscore+=30;
		}
	});
	var videos=post.find('iframe.youtube-player').length;
	videos+=post.find('a[href^="http://vimeo.com/"]').length;
	videos += post.find('a[href^="https://vimeo.com/"]').length;
	postscore += videos * 5;

	//n.country=country;
	var lastdate=n.lastdate;
	n.lastdate=date;
	if( date-lastdate < 65000 && prevuser==user && chars<100 && numpics==0) { n.spam++; /*return;*/ }
	
	if( posttext.match(/(\[QUOTE\])|(\[\/QUOTE\])/) ) { n.spam++; /*return;*/ }//don't need to return on spam anymore?
	
	var cont=n.types['normal'];
	cont.posts++;
	cont.chars+=chars;
	cont.pics+=numpics;
	//cont.excls+=excls;
	cont.videos+=videos;
	prevuser=user;
	
	CountWords(user, date, hours_ago, post, postlink, favteam, posttext);
	
	//if(postscore>0) console.log('postscore == '+postscore);
	n.score += postscore;
	if (recent) n.recentscore += postscore;
	AddToTimeslice(user, country, date, hours_ago, post, postlink, favteam, postscore);
	for (var t = 0; t < mytags.length; t++) {
	    var tag = mytags[t].toLowerCase();
	    tag = tag.replace(' ', '');
	    tags[tag].score += postscore;
	    if (recent) tags[tag].recentscore += postscore;
	}
	posts_indexed[index].score = postscore;
}

function RunStats(start)
{
	console.log('\nrunning stats...\n');
	
	tbody.find('header a:not(a.submessage),.fpost-actionable').remove();//remove links for PM, Profile, etc, signature, and Last edit text
	tbody.find('br').replaceWith(' ');
	counter=0;
	var start_date = new Date();

	var post_headers = tbody.find('tr header');
	//var last_seconds_ago = 0;
	var last_timestamp_start = 0;
	console.log('found ' + post_headers.length + ' post headers');
	for (var i = 0; i < post_headers.length; i++) {
	    //console.log(i);
	    var t = post_headers[i];
	    var post_age_text = $(t).find('.fpost-postinfo a.submessage').text();
	    if (post_age_text == '') {
	        console.log(t);
	        continue;
	    }
	    var hours_ago = 0;
	    var timestamp = 0;
	    var post_age_int = parseInt(post_age_text.match(/\d+/)[0]);
	    if (post_age_text.match(/\d+ seconds? ago/)) {
	        hours_ago = post_age_int / 3600;
	        var date = new Date(start_date - hours_ago * 3600 * 1000);
	        timestamp = Math.round(date.getTime()/1000);
	    } else {
	        var timestamp_text = '';
	        if (post_age_text.match(/\d+ \w+ ago/)) {
	            timestamp_text = $(t).find('.fpost-postinfo a.submessage').attr('title');
	        } else {
	            timestamp_text = post_age_text;
	        }
	        var date = new Date(timestamp_text);
	        timestamp = Math.round(date.getTime()/1000);
        }
	    var seconds_ago = timestamp;
	    /*if (seconds_ago != last_seconds_ago && i>0) {
	        var len = i - last_timestamp_start;
	        if (last_timestamp_start > 0) {
	            last_timestamp_start--;
	            last_seconds_ago = $(post_headers[last_timestamp_start]).attr('timestamp');
	            len++;
	        }
	        var step = (last_seconds_ago - seconds_ago) / len;
	        step = Math.floor(step);
	        step = 1;
	        console.log('interpolating timestamp start, from '+last_timestamp_start+' to '+i+', step=='+step);
	        for (var e = last_timestamp_start; len>2 && e < i; e++) {
	            if ($(post_headers[e]).attr('timestamp') != last_seconds_ago) console.log('interpolating timestamp from ' + $(post_headers[e]).attr('timestamp') + ' to ' + last_seconds_ago);
	            $(post_headers[e]).attr('timestamp', last_seconds_ago);
	            last_seconds_ago -= step;
	        }
	        last_timestamp_start = i;
	    }*/
	    if (seconds_ago <= last_seconds_ago && i > 0) seconds_ago=last_seconds_ago+0.5;//will there ever be 60 posts in the same minute? and then consecutive minutes would have to overlap too lol
	    last_seconds_ago = seconds_ago;
	    $(t).attr('timestamp', seconds_ago);
	}

	console.log('found ' + tbody.find('tr header').length + ' posts');
	tbody.find('tr header').each(
	function(){
	    counter++;
	    //console.log(counter);
		if(window.hasOwnProperty('tempnames')==false && counter<=start) return;
		
		var user = $(this).find('.fpost-username > span').text();
		var country = $(this).find('.fpost-userinfo .tt-userinfo:nth-child(1)').text();
		if (country.match(/\d+ Posts/)) country = '';
		var joined = '';
	    try {
	        joined = $(this).find('aside.tooltip span.tt-userinfo').text().match(/Joined \s*\w+\s* (\d{4})/)[1];
	        joined = parseInt(joined);
	    } catch (e) { }
	    

		var postlink='http://www.teamliquid.net'+$(this).find('.fpost-postinfo a.submessage').attr('href');
	    try {
	        postlink=parseInt( postlink.match(/viewpost.php\?post_id=(\d+)$/)[1] );
	    } catch (e) {
	        console.log(this);
	        return;
	    }
	    var favteam = 0;
	    try {
	        favteam = parseInt($(this).parent().attr('style').replace('background-image:url(/images/starcraft/teams/', '').replace('.png)', ''));
	    } catch (e) { }
		var post = $(this).parent().find('article.forumPost section');
		var sig = $(this).parent().parent().find('footer div.forumsig').text().replace(/\s+/g, ' ');
		//if(user=='Roadog') console.log(sig);
		var favplayer = '';
		var m = sig.match(/(\#?[\w]{2,50})/g);
		//if(user=='Roadog') console.log(JSON.stringify(m));
		for (var i = 0; m && i < m.length; i++) {
		    if (o_relevant_players.hasOwnProperty(m[i].toLowerCase())) {
		        favplayer = o_relevant_players[m[i].toLowerCase()];
		        break;
		    }
		}

		var post_age_text = $(this).find('.fpost-postinfo a.submessage').text();
		var date = new Date(parseInt($(this).attr('timestamp')) * 1000);
		var hours_ago = (start_date-date) / 1000 / 3600;
		//console.log(date, hours_ago);

		ProcessPost(user, country, date, hours_ago, post, postlink, favteam, favplayer, joined);
	});
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function VisitPostsChildren(index, func)
{
	var p=posts_indexed[index];
	func(p);
	for(var child in p.children) {
		VisitPostsChildren(p.children[child], func);
	}
}

function MakeASCIIGraph(lines, width, height, logarithmic)
{
    //lines = [ {name:'foobar',points:[{timestamp:123,y:456}]} ];
    var out = '';
    var arr = [];
    var height_map = [];
	var count_map = [];
    var symbols = [' ', 'X', '-', '_', '/', '\\', '+'];
    if (lines.length == 1) {
        //symbols = [' ','M','?','=','/','\\','_','-','^'];
    }
    for (var y = 0; y < height; y++) {
        arr[y] = [];
        for (var x = 0; x < width; x++) {
            arr[y][x] = 0;
        }
    }
    for (var x = 0; x < width * 2; x++) {
        height_map[x] = 0;
		count_map[x] = 0;
    }

	var total = 0;
    var scaleX = 1.0;
    var scaleY = 1.0;
    var minX = lines[0].points[0].timestamp;
    var maxX = lines[0].points[0].timestamp;
    var minY = lines[0].points[0].y;
    var maxY = lines[0].points[0].y;
    for (var l = 0; l < lines.length; l++) {
        for (var i = 0; i < lines[l].points.length; i++) {
            var p = lines[l].points[i];
            if (p.timestamp < minX) minX = p.timestamp;
            if (p.timestamp > maxX) maxX = p.timestamp;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
			total += p.y;
        }
    }
	console.log(minY);
    scaleX = (width-1) / (maxX - minX);
    scaleY = (height - 1) / (maxY - minY);
    scaleX *= 2;

    for (var l = 0; l < lines.length; l++) {
        //var height_map = [];
        var last_x = 0;
        var last_y = 0;
        for (var i = 0; i < lines[l].points.length; i++) {
            var p = lines[l].points[i];
            var y = p.y - minY;
            var x = p.timestamp - minX;
            y = y;// * scaleY;
            x = x * scaleX;
            var y_step = (y - last_y) / (x - last_x);
            last_x = Math.round(last_x);
            for (last_x++; last_x < Math.round(x); last_x++) {
                last_y += y_step;
                var s = 6;
                if (y_step < 0) s = 7;
                //arr[Math.round(last_y)][last_x] = s;
                //height_map[last_x] = Math.max(height_map[last_x], last_y);
				height_map[last_x] += last_y;
				count_map[last_x]++;
			}
            //height_map.push(y);
            last_x = x;
            last_y = y;
            //arr[Math.round(y)][Math.round(x)] = l + 1;
            //height_map[Math.round(x)] = Math.max(height_map[Math.round(x)], y);
			height_map[Math.round(x)] += y;
			count_map[Math.round(x)]++;
        }
    }

	minY = 0;//height_map[0]/count_map[0];
    maxY = height_map[0]/count_map[0];
	for(var i=0;i<height_map.length;i++) {
		var a=height_map[i]/count_map[i];
		if(a<minY) minY=a;
		if(a>maxY) maxY=a;
	}
	var oldmaxY = maxY - 1;
	maxY = 0;
	for (var i = 0; i < height_map.length; i++) {
	    var a = height_map[i] / count_map[i];
	    if (a < minY) minY = a;
	    if (a > maxY && a<oldmaxY) maxY = a;
	}
	if (maxY > oldmaxY * 0.25) maxY = oldmaxY + 1;
	else maxY = (oldmaxY + 1) * 0.25;
	maxY=Math.ceil(maxY);
	scaleY = (height - 1) / (maxY - minY);
	if (logarithmic) scaleY = (height - 1) / Math.log(maxY - minY +1);
	console.log(JSON.stringify({height_map:height_map, count_map:count_map}));
	
    for (var i = 0; i < width; i++) {
        var a = height_map[i * 2];
        var b = height_map[i * 2 + 1];
		a /= Math.max(1,count_map[i*2]);//prevent divides by 0
		b /= Math.max(1, count_map[i * 2 + 1]);
		if (logarithmic) {
		    a = Math.log(a+1);
		    b = Math.log(b+1);
		}
		a *= scaleY;
		b *= scaleY;
        var m = Math.max(a, b);
        var r = Math.round(m);
        var s = Math.round(Math.min(a, b));
        var plus = 0;
        if (r >= arr.length) {
            plus = 1;
            r = arr.length - 1;
        }
        for (var y = r; y >= 0; y--) {
            arr[y][i] = 1;
        }
        if (plus) {
            arr[r][i] = 6;
            for (var y = r; y >= 0; y--) {
                arr[y][i] = 6;
            }
        }
        else if (m % 1 < 0.25) arr[r][i] = 3;
            //else if (m % 1 < 0.5) arr[r][i] = 2;
        else if (a - b > 0.75) arr[r][i] = 5;
        else if (a - b < -0.75) arr[r][i] = 4;
    }

    for (var y = height-1; y >= 0; y--) {
        for (var x = 0; x < width; x++) {
            out += symbols[arr[y][x]];
        }
        out += '\n';
    }
    out = out.replace(/ +\n/g, '\n');
    var graphtext = out;
    out = 'top = ' + maxY + ' PASSIONPOINTS per 5 minutes, ';
    //if (logarithmic) out += 'middle = '+((maxY+minY)/2)+' PASSIONPOINTS per 5 minutes,';//fuck it, too tough lol
    out += 'each character = ~' + ((1 / (scaleX / 2 * 1000 * 60)) + '').substr(0, 6) + ' minutes, from [date]' + (new Date(minX)).toUTCString() + '[/date] to [date]' + (new Date(maxX)).toUTCString() + '[/date]\n[code]' + graphtext;
    for (var x = 0; x < width; x += 10) {
        //show time ticks
    }
    out += '[/code]bottom = ' + minY + ' PASSIONPOINTS per 5 minutes, '+Math.round(total)+' total PASSIONPOINTS in this timespan';
    return out;
}

function OutputUser(u, place)
{
    var out = '';
    var is_group = false;
    var type = 'user';
    if (u.hasOwnProperty('type')) {
        type = u.type;
        is_group = true;
    }
    var joined_year = u.joined_year;
    var favteam = u.favteam;
    var favplayer = u.favplayer;
    var country;

    if (is_group) {
        var a_teams = [];
        var a_countries = [];
        var a_players = [];
        var a_joinedyears = [];
        for (var t in u.favteams) {
            if (!u.favteams.hasOwnProperty(t)) continue;
            if (t == 0) continue;
            a_teams.push(u.favteams[t]);
        }
        for (var p in u.favplayers) {
            if (!u.favplayers.hasOwnProperty(p)) continue;
            if (p == "") continue;
            a_players.push(u.favplayers[p]);
        }
        for (var c in u.countries) {
            if (!u.countries.hasOwnProperty(c)) continue;
            if (c == "") continue;
            a_countries.push(u.countries[c]);
        }
        for (var y in u.joinedyears) {
            if (!u.joinedyears.hasOwnProperty(y)) continue;
            a_joinedyears.push(u.joinedyears[y]);
        }
        a_teams.sort(function (a, b) { return b.score - a.score; });
        a_players.sort(function (a, b) { return b.score - a.score; });
        a_countries.sort(function (a, b) { return b.score - a.score; });
        a_joinedyears.sort(function (a, b) { return b.score - a.score; });
        
        if (type!='favteam' && a_teams.length) favteam = a_teams[0].name;
        if (type != 'favplayer' && a_players.length) favplayer = a_players[0].name;
        if (type != 'country' && a_countries.length) country = a_countries[0].name;
        if (type != 'joinedyear' && a_joinedyears.length) joined_year = a_joinedyears[0].name;
        //out += JSON.stringify({teams:a_teams, players:a_players, countries:a_countries, joined_years:a_joinedyears});
    }

    if (place != 0) out += '#' + place + ' ';
    out += u.name + ' - score: ' + Math.round(u.score) + ' (+' + Math.round(u.recentscore) + ')';
    //if (is_group == false && joined_year) out += ', joined in: ' + joined_year;
    if (is_group) out += ', users: ' + u.users;
    if (favteam) out += ', fav team: ' + teams[favteam];
    if (favplayer.length > 0) out += ', fav player: ' + favplayer;
    if (is_group == true && joined_year) out += ', top joined in year: ' + joined_year;
    if (country) out += ', top country: ' + country;
    out += '\n';
    return out;
}

function AddUserToGroup(u, g, type)
{
    g.score += u.score;
    g.recentscore += u.recentscore;
    if (!g.hasOwnProperty('favteams')) {
        g.favteams = {};
        g.favplayers = {};
        g.countries = {};
        g.joinedyears = {};
        g.users = 0;
    }
    g.type = type;
    g.users++;
    if (!g.favteams.hasOwnProperty(u.favteam)) g.favteams[u.favteam] = { name:'', score: 0, users: 0 };
    g.favteams[u.favteam].name = u.favteam;
    g.favteams[u.favteam].score += u.score;
    g.favteams[u.favteam].users++;
    if (!g.favplayers.hasOwnProperty(u.favplayer)) g.favplayers[u.favplayer] = { name: '', score: 0, users: 0 };
    g.favplayers[u.favplayer].name = u.favplayer;
    g.favplayers[u.favplayer].score += u.score;
    g.favplayers[u.favplayer].users++;
    if (!g.countries.hasOwnProperty(u.country)) g.countries[u.country] = { name: '', score: 0, users: 0 };
    g.countries[u.country].name = u.country;
    g.countries[u.country].score += u.score;
    g.countries[u.country].users++;
    if (!g.joinedyears.hasOwnProperty(u.joined_year)) g.joinedyears[u.joined_year] = { name: '', score: 0, users: 0 };
    g.joinedyears[u.joined_year].name = u.joined_year;
    g.joinedyears[u.joined_year].score += u.score;
    g.joinedyears[u.joined_year].users++;
}

function PostIdToLink(id) {
    return '/forum/viewpost.php?post_id=' + id;
}

function OutputStats()
{
    var summlen = 90;
    var out = '[center][big][b]#PASSIONBOARD4EVER2016[/b][/big]\n';
    //out += '[big][b][big][red][countdown]November 1 2015 1900 CET[/countdown][/red][/big][/b][/big]\n';
    //out += '[big][b][big][red][countdown]November 6 2015 1200 PST[/countdown][/red][/big][/b][/big]\n';
	out += '[big][b][big][red][countdown]November 4 2016 1300 CDT[/countdown][/red][/big][/b][/big]\n';

	out += 'This new PASSIONBOARD is for promoting ON-TOPIC conversation. Do not abuse it or the mods could get angry.[/center]\n'; //from iHirO http://www.teamliquid.net/forum/viewpost.php?post_id=23151129
	out += '[QUOTE]';
	out += '[center][img]http://i.imgur.com/S1afX6r.gif[/img][/center]\n';
	
    //build a list of conversations, then sort them and further filter them, then output them

	var a_users = [];
	var everyone = MakeUser('EVERYONE');
	var countries = {};
	var countriesa = [];
	var favteams = {};
	var favteamsa = [];
	var favplayers = {};
	var favplayersa = [];
	var joinedyears = {};
	var joinedyearsa = [];
	var na = MakeUser('[small]north[/small] [big]AMERICA[/big]');
	var restoftheworld = MakeUser('Unimportant Parts of the World');
	var unknown = MakeUser('Unknown Region');
    //also do favorite teams, and countries, member joined years? lol
	for (var n in names) {
	    var u = names[n];
	    var region = restoftheworld;
	    if (u.country == 'United States' || u.country == 'Canada' || u.country == 'Greenland' || u.country == 'Mexico') {
	        region = na;
	    } else if (u.country == '') {
	        region = unknown;
	    }
	    if (!countries[u.country]) countries[u.country] = MakeUser(u.country);
	    if (!favteams.hasOwnProperty(u.favteam)) favteams[u.favteam] = MakeUser(teams[u.favteam]);
	    if (!favplayers.hasOwnProperty(u.favplayer)) favplayers[u.favplayer] = MakeUser(u.favplayer);
	    if (!joinedyears.hasOwnProperty(u.joined_year)) joinedyears[u.joined_year] = MakeUser(u.joined_year);

	    AddUserToGroup(u, favteams[u.favteam], 'favteam');
	    AddUserToGroup(u, favplayers[u.favplayer], 'favplayer');
	    AddUserToGroup(u, joinedyears[u.joined_year], 'joinedyear');
	    AddUserToGroup(u, region, 'region');
	    AddUserToGroup(u, countries[u.country], 'country');
	    AddUserToGroup(u, everyone, 'everyone');
	    a_users.push(u);
	}
	for (var i in countries) {
	    if (!countries.hasOwnProperty(i)) continue;
	    if (i == 'United States') countries[i].name = 'AMERICA! FUCK YEA!';
	    if (i == '') countries[i].name = 'Blank Country';
	    countriesa.push(countries[i]);
	}
	countriesa.sort(function (a, b) {
	    return b.score - a.score;
	});
	for (var i in favteams) {
	    if (!favteams.hasOwnProperty(i)) continue;
	    favteamsa.push(favteams[i]);
	}
	favteamsa.sort(function (a, b) {
	    return b.score - a.score;
	});
	for (var i in favplayers) {
	    if (!favplayers.hasOwnProperty(i)) continue;
	    if (i == '') favplayers[i].name = 'None';
	    favplayersa.push(favplayers[i]);
	}
	favplayersa.sort(function (a, b) {
	    return b.score - a.score;
	});
	for (var i in joinedyears) {
	    if (!joinedyears.hasOwnProperty(i)) continue;
	    joinedyearsa.push(joinedyears[i]);
	}
	joinedyearsa.sort(function (a, b) {
	    return b.score - a.score;
	});
	a_users.push(everyone);
	a_users.sort(function (a, b) {
		if(a.name=='EVERYONE') return -1;
		if(b.name=='EVERYONE') return 1;
	    return b.score - a.score;
	});

	out += '[center][big]';
	for (var i in a_users) {
	    var u = a_users[i];
	    var place = parseInt(i);
	    if (i == 21) {
	        //break;
	        out += '[/big][spoiler=More][big]';
	    }
	    if (i == 101) {
	        break;
	    }
	    out += OutputUser(u, place);
	}
	if (a_users.length > 21) out += '[/big][/spoiler]';
	else out += '[/big]';
	out += '\n\n[spoiler=Other Leaderboards]';
	out += '[b]Regions[/b]\n';
	out += OutputUser(na, 0);
	out += OutputUser(restoftheworld, 0);
	out += OutputUser(unknown, 0);
	out += '[spoiler=Countries]';
	for (var i in countriesa) {
	    var c = countriesa[i];
	    var place = parseInt(i) + 1;
	    /*if(c.score>0)*/ out += OutputUser(c, place);
	}
	out += '[/spoiler]\n\n';
	out += '[spoiler=Teams]';
	for (var i in favteamsa) {
	    var t = favteamsa[i];
	    var place = parseInt(i) + 1;
	    /*if(c.score>0)*/ out += OutputUser(t, place);
	}
	out += '[/spoiler]\n';
	out += '[spoiler=Players]';
	for (var i in favplayersa) {
	    var p = favplayersa[i];
	    var place = parseInt(i) + 1;
	    /*if(c.score>0)*/ out += OutputUser(p, place);
	}
	out += '[/spoiler]\n';
	out += '[spoiler=Joined Years]';
	for (var i in joinedyearsa) {
	    var p = joinedyearsa[i];
	    var place = parseInt(i) + 1;
	    /*if(c.score>0)*/ out += OutputUser(p, place);
	}
	out += '[/spoiler]\n';

	out += '[/spoiler]';
	out += '[/center]Set your favorite player by adding them to your sig! The first relevant player detected is marked as your favorite!\n\n';
    
	out += '[spoiler=Recent Conversations]These are the 20 conversations that have been replied to the most recently, and also have at least 3 replies.\n\n';
	var convos=[];
	for(var i in posts_indexed) {
		if(!posts_indexed.hasOwnProperty(i)) continue;
		var p = posts_indexed[i];
		if(p.parent.length>0) continue;
	    if(p.descendants<3) continue;
		//if (p.descendants < 1) continue;
		//if(p.last_reply<(new Date())-3600*24*1000 ) continue;
		//out += p.summary+' http://www.teamliquid.net/forum/viewpost.php?post_id='+p.link+'\n';
	    var c = { post: p, replies: [] };
	    var tindex = {};
		for(var child in p.children) {
		    VisitPostsChildren(p.children[child], function (p) {
		        if(tindex.hasOwnProperty(p.link)) return;
		        tindex[p.link]=1;
		        p.index = c.replies.length;
				c.replies.push(p);
			});
		}
		c.index = convos.length;
		convos.push( c );
	}
	convos.sort(function (a, b) {
	    if (b.post.last_reply == a.post.last_reply) return b.index - a.index;
		return b.post.last_reply - a.post.last_reply;
	});
	//console.log(convos);
	for(var i=0;i<convos.length && i<20;i++) {
		var p=convos[i].post;
		var replies=convos[i].replies;
		replies.sort(function (a, b) {
		    if (b.date == a.date) return b.index - a.index;
			return b.date - a.date;
		});
		var link = PostIdToLink(p.link);
		var max_replies = 5;
		out += '[b]' + p.user + '[/b] [url=' + link + '][date]' + p.date.toUTCString().replace(/:\d\d GMT$/, ' GMT') + '[/date][/url]:\n' + SummarizeText(p.summary, summlen*2) + '\n';//longer summary for top post?
		if (replies.length > max_replies) out += '[spoiler=Last '+max_replies+' out of ' + replies.length + ' replies]';
		else out += '[spoiler=' + replies.length + ' replies]';
		//var last_reply;
		var a = replies.length - 1;
		if (a > max_replies-1) a = max_replies - 1;//0 counts!
		for(; a>=0; a--) {
		    var r = replies[a];
		    //if (r.link == last_reply) continue;
		    //last_reply = r.link;
			var rlink = PostIdToLink(r.link);
			out += '--[b]' + r.user + '[/b] [url=' + rlink + '][date]' + r.date.toUTCString() + '[/date][/url]:\n' + SummarizeText(r.summary, summlen*2) + '\n\n';
		}
		out+='[/spoiler]\n\n';
	}
	out += '[/spoiler]\n\n';

	var max_per_keyword = 10;
	out += '[b]Highlighted Keywords[/b] - Most Recent '+max_per_keyword+' Posts. Posts using at least 1 highlighted keyword are awarded 1 point + 1/10th of a point for each character in the post. (These are not case sensitive)\n'
	//var highlighted_tags = ['Protoss', 'Terran', 'Zerg', 'Blizzcon', '#IMadeThis', 'FanFic', 'FanFics', 'CoopFanFic', 'CoopFanFics', 'Prediction', 'Predictions', /*'#GiftPoints',*/ 'SigBet', 'SigBets', 'PassionBet', 'PassionBets'];
	var thts = [{name:'Players', tags:relevant_players.concat(['Neeb'])}, {name:'Prediction', tags:['Prediction','Predictions']}, {name:'SigBet', tags:['SigBet', 'SigBets']}, {name:'PassionBet', tags:['PassionBet','PassionBets']} ];
	var marked_tags={};
	for (var t in thts) {
	    if (!thts.hasOwnProperty(t)) continue;
		var o = thts[t];
		for(var i=0; i < o.tags.length; i++) {
			marked_tags[o.tags[i]]=1;
		}
	}
	for (var t in highlighted_tags) {
	    if (!highlighted_tags.hasOwnProperty(t)) continue;
		if (marked_tags.hasOwnProperty(highlighted_tags[t])) continue;
	    var tagname = highlighted_tags[t];
		thts.push({name:tagname, tags:[tagname]});
	}
	for (var t in thts) {
	    if (!thts.hasOwnProperty(t)) continue;
	    var tagname = thts[t].name;
	    out += '[spoiler=' + tagname + ']';
		
		var tps = [];
		var copied_posts = {};
		var score=0;
		var recentscore=0;
		for(var i=0;i<thts[t].tags.length; i++) {
			var tagid = thts[t].tags[i].toLowerCase();
			var tag = tags[tagid];
			if (!tags.hasOwnProperty(tagid)) {
				continue;
			}
			score+=tag.score;
			recentscore+=tag.recentscore;
			for (var i = 0; i < tag.posts.length; i++) {
				var p = tag.posts[i];
				if(copied_posts.hasOwnProperty(p.link)) continue;
				copied_posts[p.link]=1;
				p.index = i;
				tps.push(p);
			}
		}
	    tps.sort(function (a, b) {
	        if (b.date == a.date) return b.index - a.index;
	        return b.date - a.date;
	    });
		out += 'Includes posts containing the keywords ';
		var recentscore=0;
		for(var i=0;i<thts[t].tags.length; i++) {
			tagid = thts[t].tags[i];
			if(i+1 >= thts[t].tags.length && i>0) out += 'and ';
			out += tagid
			if(i+1<thts[t].tags.length && thts[t].tags.length>2) out += ', ';
			else if(thts[t].tags.length==2) out += ' ';
		}
		out += ' (case insensitive).\n';
	    out += 'Score: ' + Math.round(score) + ' (+' + Math.round(recentscore) + ')\n\n';
	    //var tps = tag.posts;
	    var max = max_per_keyword;
	    var a = max-1;
	    if (a <0 || a>=tps.length) a = tps.length-1;
	    for (; a>=0 && a < tps.length; a--) {
	        var p = tps[a];
	        var plink = PostIdToLink(p.link);
	        out += '[b]' + p.user + '[/b] [url=' + plink + '][date]' + p.date.toUTCString() + '[/date][/url]:\n' + SummarizeText(p.summary, summlen) + '\n\n';
	    }
	    out += '[/spoiler]\n';
	}
	out += '\n';
	
	var most_passionate_posts = [];
	for(var i in posts_indexed) {
		if(!posts_indexed.hasOwnProperty(i)) continue;
		most_passionate_posts.push( posts_indexed[i] );
	}
	most_passionate_posts.sort(function (a, b) {
		if (b.score == a.score) return b.date - a.date;
		return b.score - a.score;
	});
	out+='[spoiler=Most Passionate Posts]'
	for(var i=0;i<20 && i<most_passionate_posts.length;i++) {
		var p = most_passionate_posts[i];
		var plink = PostIdToLink(p.link);
		out += '#'+(i+1)+' with '+p.score+' points - [b]' + p.user + '[/b] [url=' + plink + '][date]' + p.date.toUTCString() + '[/date][/url]:\n' + SummarizeText(p.summary, summlen*2) + '\n\n';
	}
	out+='[/spoiler]\n';

    //show recent images! other links?
	var max_pics = 50;
	out += '[spoiler=Most Recent '+max_pics+' Pictures]Pictures are worth 30 points each.\n\n';
	for (var a = Math.max(0, images.posts.length - max_pics - 1) ; a < images.posts.length; a++) {
	    var p = images.posts[a];
	    var plink = PostIdToLink(p.link);
	    out += '[img]' + p.summary + '[/img]\n[url=' + plink + ']Posted by ' + p.user + ' on [date]' + p.date.toUTCString() + '[/date][/url]\n\n';
	}
	out += '[/spoiler]\n';
	out += '[/QUOTE]';
	
	if (timeslices.length > 0) {
	    var day1_lines = [];
	    var blizzcon_lines = [];
	    var lines_recent = [];
	    var lines_48hr = [];
	    var passionline_day1 = {name:'Passion',points:[]};
	    var postsline_day1 = { name: 'Posts', points: [] };
	    var passionline_blizzcon = { name: 'Passion', points: [] };
	    var postsline_blizzcon = { name: 'Posts', points: [] };
	    var passionline_recent = { name: 'Passion', points: [] };
	    var postsline_recent = { name: 'Posts', points: [] };
	    var passionline_48hr = { name: 'Passion', points: [] };
	    var postsline_48hr = { name: 'Posts', points: [] };
	    var test = { name: 'Test', points: [] };
	    var start = timeslices[timeslices.length - 1].timestamp - 24 * 60 * 60 * 1000;
	    var start_48hr = timeslices[timeslices.length - 1].timestamp - 48 * 60 * 60 * 1000;
	    for (var i = 0; i < timeslices.length; i++) {
	        var t = timeslices[i];
	        if (t.timestamp < new Date('11/3/2016 10:00 PM')) {
	            passionline_day1.points.push({ timestamp: t.timestamp, y: t.points });
	            postsline_day1.points.push({ timestamp: t.timestamp, y: t.posts });
	        } else {
	            passionline_blizzcon.points.push({ timestamp: t.timestamp, y: t.points });
	            postsline_blizzcon.points.push({ timestamp: t.timestamp, y: t.posts });
	        }
	        if (t.timestamp >= start) {
	            passionline_recent.points.push({ timestamp: t.timestamp, y: t.points });
	            postsline_recent.points.push({ timestamp: t.timestamp, y: t.posts });
	        }
	        if (t.timestamp >= start_48hr) {
	            passionline_48hr.points.push({ timestamp: t.timestamp, y: t.points });
	            postsline_48hr.points.push({ timestamp: t.timestamp, y: t.posts });
	        }
	        //test.points.push({ timestamp: i, y: Math.sin(i / 1.5) });
	        //test.points.push({ timestamp: i+0.5, y: Math.sin((i+0.5) / 1.5) });
	    }
	    day1_lines.push(passionline_day1);
	    blizzcon_lines.push(passionline_blizzcon);
	    //lines.push(postsline);
	    //lines.push(test);
	    /*out += '\n[spoiler=Ro16 Passion Graph]';
	    out += MakeASCIIGraph(day1_lines, 80, 100);
	    out += '[/spoiler]\n';*/
	    /*out += '[spoiler=Blizzcon Passion Graph]';
	    out += MakeASCIIGraph(blizzcon_lines, 80, 100);
	    //out += 'Nothing yet!';
	    out += '[/spoiler]\n';2*/
	    /*out += '\n[spoiler=Logarithmic Passion Graph]';
	    out += MakeASCIIGraph(lines, 80, 30, 1);
	    out += '[/spoiler]\n';*/
	    out += '[spoiler=Passion Graph Last 24 Hours]';
	    lines_recent.push(passionline_recent);
	    out += MakeASCIIGraph(lines_recent, 80, 40);
	    out += '[/spoiler]\n';
	    out += '[spoiler=Passion Graph Last 48 Hours]';
	    lines_48hr.push(passionline_48hr);
	    out += MakeASCIIGraph(lines_48hr, 80, 40);
	    out += '[/spoiler]\n';
	}

	if (lastpassionboard) out += '[url=http://www.teamliquid.net/forum/viewpost.php?post_id=' + lastpassionboard + ']Previous #PASSIONBOARD post[/url]';
	else out += 'No previous #PASSIONBOARD yet';
	
	console.log('\n\n\n\n' + out + '\n\n\n' + out.length + '/100000 characters\n');
	$('textarea#reply_area').val(out);
}
