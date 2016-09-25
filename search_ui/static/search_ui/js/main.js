$(function() {
    console.log( "ready!" );
    var pag = $('#pagination').simplePaginator({
      totalPages: 6,
      pageChange: function(page) {
        console.log("pagination is working" + page);
        $('#content_pagination').empty().text('Page is ' + page);
        var res = $('#link_generation').data('res');
        if (res == null) {
            return;
        }
        console.log(res['val']);
        var result = res['val']
        var pages = {docs : result.pages[page]};
        show_next_search(pages);
      }
    });

    pag.simplePaginator('hide');

    $('#post-form').submit(function(event){
        event.preventDefault();
        console.log("form submitted!")
        $.post('/search_ui/', $(this).serialize(), function(data){
            var j_obj = JSON.parse(data)
            filter_and_show(j_obj.result)

            //return result
        });
    });

    function create_links(link_count, result){

        clear_previous_link();
        console.log("total link count are ", link_count);
        if (link_count < 0) {
            pag.simplePaginator('hide');
            return;
        }
        $('#link_generation').data('res', {val: result});
        pag.simplePaginator('setTotalPages', link_count);
        console.log("this is explicit call");
    }

    function filter_and_show(result){
        //$("#all_result").html(JSON.stringify(result))
        $('#search_count').html("Total results found are " + JSON.stringify(result.docs.length))
        var link_count=Math.round((result.docs.length/7 -3));
        clear_previous_search();
        create_links(link_count, result)
        for (var i=0; i<result.docs.length && i<8;i++) {
            $("a[target=user"+i+"]").html("Tweeted by:"+result.docs[i]["user.name"]);
            $("a[target=user"+i+"]").data("tweet_id",{id:result.docs[i].id});
            $("a[target=user"+i+"]").attr("href","display_tweet/?q="+result.docs[i].id);
            $("a[target=link_user"+i+"]").html("tweet_link: display_tweet/"+result.docs[i].id);
            $("a[target=link_user"+i+"]").attr("href","display_tweet/?q="+result.docs[i].id);
            $("#search"+i+"_snippet").html(JSON.stringify(result.docs[i].text[0]));

        }
        //console.log(result)
        show_trend_chart(result.hashtag_trends, '#hashtag_container', "Hashtag Trends",result.docs);
        show_recommendations(result.recommendations);
        show_sentiment_trend_chart(result.location_trends, "#location_container", "Location Trends", result.docs);
    }

    function filter_docs(docs, filter_param, param_value){
//        console.log(docs)
        var filtered_docs = [];
        for(var doc in docs){
//            console.log(docs[doc])
//            console.log(Object.keys(docs[doc]))
            if(filter_param in docs[doc]  && docs[doc][filter_param] == param_value)
            {
                //console.log("Waah mere sher")
                filtered_docs.push(docs[doc]);
            }
        }

        //console.log(filtered_docs);

        $('#search_count').html("Total results found are " + JSON.stringify(filtered_docs.length))
        var link_count=Math.round(filtered_docs.length/7 -3);
        clear_previous_search();

        for (var i=0; i<filtered_docs.length && i<8;i++) {
           // console.log(filtered_docs[i])
            $("a[target=user"+i+"]").html("Tweeted by:"+filtered_docs[i]["user.name"]);
            $("a[target=user"+i+"]").data("tweet_id",{id:filtered_docs[i].id});
            $("a[target=user"+i+"]").attr("href","display_tweet/?q="+filtered_docs[i].id);
            $("a[target=link_user"+i+"]").html("tweet_link: display_tweet/"+filtered_docs[i].id);
            $("a[target=link_user"+i+"]").attr("href","display_tweet/?q="+filtered_docs[i].id);
            $("#search"+i+"_snippet").html(JSON.stringify(filtered_docs[i].text[0]));

        }

    }
    function filter_docs_by_hashtag(docs,hashtag_param, hashtag_value){
        var filtered_docs = [];
        hashtag_value = hashtag_value.slice(1);
        for(var doc in docs){
            if(hashtag_param in docs[doc] && docs[doc][hashtag_param].indexOf(hashtag_value)>-1){
                 filtered_docs.push(docs[doc]);
               /* for(var j=0;j<docs[doc][hashtag_param].length;j++){
                   // if(docs[doc][hashtag_param][j].toLowerCase() === (hashtag_value.toLowerCase()))

                    //console.log();
                } */
            }
        }
        $('#search_count').html("Total results found are " + JSON.stringify(filtered_docs.length))
        var link_count=Math.round(filtered_docs.length/7 -3);
        clear_previous_search();

        for (var i=0; i<filtered_docs.length && i<8;i++) {
           // console.log(filtered_docs[i])
            $("a[target=user"+i+"]").html("Tweeted by:"+filtered_docs[i]["user.name"]);
            $("a[target=user"+i+"]").data("tweet_id",{id:filtered_docs[i].id});
            $("a[target=user"+i+"]").attr("href","display_tweet/?q="+filtered_docs[i].id);
            $("a[target=link_user"+i+"]").html("tweet_link: display_tweet/"+filtered_docs[i].id);
            $("a[target=link_user"+i+"]").attr("href","display_tweet/?q="+filtered_docs[i].id);
            $("#search"+i+"_snippet").html(JSON.stringify(filtered_docs[i].text[0]));

        }
    }

    function show_sentiment_trend_chart(trends, div, chart_title, docs){
        console.log("Showing Sentiments")
        var attr_list = Object.keys(trends);
        locations = trends['locs']
        pos = trends['pos']
        neg = trends['neg']

        $(div).highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: chart_title
            },
            xAxis: {
                categories: locations
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Numbers'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                        style: {
                            textShadow: '0 0 3px black'
                        }
                    }
                },

                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                filter_docs(docs, 'user.time_zone', this.category)
                            }
                        }
                    }
                }
            },

            series: [{
                name: 'Positive',
                data: pos
            }, {
                name: 'Negative',
                data: neg
            }]
        });
    }




    window.DoPost = function(content_id){
//         console.log("Coming here");
         var reco=$(content_id).text()
         $.post('/search_ui/',{search_field: reco}, function(data){
            var j_obj = JSON.parse(data)
            filter_and_show(j_obj.result)
        });


    }

    function show_recommendations(recommendations){
        $("#recommendations").html("You might also be interested in: ")
        var i = 0;
        for (var key in recommendations){
            i++;
            $("#recommendation"+i).html(key)
            $("#recommendation"+i).data('key',{key:key})
        }

    }

    function show_trend_chart(trends, div, name,docs){
        var attr_list = Object.keys(trends);
        var val_list = [];

//        console.log(trends);
//        console.log(attr_list);
        for(var key in trends){
//            console.log(key);
            val_list.push(trends[key]);
        }

//        console.log(val_list);


        $(div).highcharts({
            chart: {
            type: 'column'
            },
            title: {
            text: name
            },
            xAxis: {
            categories: Object.keys(trends)
            },
            yAxis: {
            title: {
            text: 'Numbers'
            }
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                              //  alert('Category: ' + this.category + ', value: ' + this.y);
                                filter_docs_by_hashtag(docs, "entities.hashtags.text", this.category)
                            }
                        }
                    }
                }
            },
            series: [{
            name: 'Number of Users ',
            data: val_list
            },]
        });

    }

    function clear_previous_search(){
        var search=8;
        for (var i=0; i<search;i++) {
            $("a[target=user"+i+"]").html("");
            $("a[target=user"+i+"]").data("");
            $("a[target=link_user"+i+"]").html("");
            $("a[target=link_user"+i+"]").attr("");
            $("#search"+i+"_snippet").html("");
        }
    }



    function clear_previous_link(){

        $("#link_generation").html("");
    }

    window.do_next_search = function(content_id) {

        var page = $(content_id).data('pages');
        var href = $(content_id).attr('href');
        console.log(href);
        console.log(page);
        show_next_search(page);
    }

    function show_next_search(result){
        //$("#all_result").html(JSON.stringify(result))
        clear_previous_search();
        for (var i=0; i<result.docs.length && i<8;i++) {
            $("a[target=user"+i+"]").html("Tweeted by:"+result.docs[i]["user.name"]);
            $("a[target=user"+i+"]").data("tweet_id",{id:result.docs[i].id});
            $("a[target=user"+i+"]").attr("href","display_tweet/?q="+result.docs[i].id);
            $("a[target=link_user"+i+"]").html("tweet_link: display_tweet/"+result.docs[i].id);
            $("a[target=link_user"+i+"]").attr("href","display_tweet/?q="+result.docs[i].id);
            $("#search"+i+"_snippet").html(JSON.stringify(result.docs[i].text[0]));

        }

    }






    $('#changeTotalPages').click(function() {
      pag.simplePaginator('setTotalPages', 10);
    })

    $('#changePage').click(function() {
      pag.simplePaginator('changePage', 3);
      var res = $('#link_generation').data('res');
        console.log(res['val']);
        var result = res['val']
        var pages = {docs : result.pages[3]};
        show_next_search(pages);

    })

    $('#hide').click(function() {
      pag.simplePaginator('hide');
    })


    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    /*
    The functions below will create a header with csrftoken
    */

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    $('.third_page').click(function() {
            var tweet_id=$(this).data('tweet_id');
            //console.log(tweet_id);
            var url="display_tweet/?q="+tweet_id['id'];
           $("a[target='" + $(this).attr("target")+"']").attr("href",url);
    });


});







