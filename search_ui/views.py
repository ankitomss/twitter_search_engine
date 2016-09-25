import io, pycurl, json, pysolr, random
from collections import Counter

from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

from search_ui.text_preprocessing import give_recommendations, analyze_sentiments_for_top_locations, get_popular_hastags
from .forms import SearchForm


def search_form(request):
    if request.method == 'POST':
        print("YO babes working")
        query = request.POST.get('search_field')
        print("You queried for: ",query)
        #Using solr
        solr = pysolr.Solr('http://localhost:8983/solr/gettingstarted/', timeout=10)
        results = solr.search(query, **{'wt':'json','rows':10000})
        result = results.__dict__

        hashtags = [hashtag_list for tweet_data in result['docs']
                    if 'entities.hashtags.text' in tweet_data
                    for hashtag_list in tweet_data['entities.hashtags.text']]

        tweets = [tweet_data['text'][0] for tweet_data in result['docs'] if 'text' in tweet_data]

        result['hashtag_trends'] = get_popular_hastags(hashtags)
        result['recommendations'] = give_recommendations(tweets)
        result['location_trends'] = analyze_sentiments_for_top_locations(result['docs'], 'user.time_zone')

        count, page = 0, []
        pages = []
        for tweet_data in result['docs']:
            page.append(tweet_data)
            # if count == 0: print(tweet_data)
            count += 1
            if count == 8:
                count = 0
                pages.append(page)
                page = []
        pages.append(page)
        result['pages'] = pages
        return HttpResponse(json.dumps({'result' : result}))
    else:
        print("GET request bro")
        print(request)
        form = SearchForm()
    return render(request, 'search_ui/search_display.haml', {'form': form})

def display_tweet(request):
    print("request is coming to display tweet")
    if request.method == 'GET':
        id = request.GET.get('q')
        #print(id)
        solr = pysolr.Solr('http://localhost:8983/solr/gettingstarted/', timeout=10)
        results = solr.search("id:"+id, **{'wt':'json'})
        results=results.__dict__
        tweet_data=results['docs'][0]
        new_tweet={}
        bad_chars="'[]"
        for k, v in tweet_data.items():
            newkey=str(k).replace('.', '_')
            v=str(v)
            for c in bad_chars: v = v.replace(c, "")
            new_tweet[newkey]=v
        return render(request, 'search_ui/display.haml', {'result':new_tweet})

