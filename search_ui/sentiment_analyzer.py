import pickle
import collections
import nltk.metrics
from nltk.classify import NaiveBayesClassifier
from nltk.corpus import movie_reviews

def word_feats(words):
    return dict([(word, True) for word in words])

sentence = "RT @JohnRiversToo: We have to restore America to the timeless principles of our judeo-islamo-hindo-buddho-atheo-cthlulo-christian foundatio…"
sentence2 = "This place is not good"
negids = movie_reviews.fileids('neg')
posids = movie_reviews.fileids('pos')

for i in range(10):
    print(movie_reviews.words(fileids=[negids[i]]))

negfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'neg') for f in negids]
posfeats = [(word_feats(movie_reviews.words(fileids=[f])), 'pos') for f in posids]

negcutoff = len(negfeats)*3//4
poscutoff = len(posfeats)*3//4

#print(negfeats)
trainfeats = negfeats[:negcutoff] + posfeats[:poscutoff]
testfeats = negfeats[negcutoff:] + posfeats[poscutoff:]
print("Train on {0} instances, test on {1} instances".format(len(trainfeats), len(testfeats)))

classifier = NaiveBayesClassifier.train(trainfeats)
with open('my_classifier.pickle','wb') as f:
    pickle.dump(classifier,f)


refsets = collections.defaultdict(set)
testsets = collections.defaultdict(set)

print(classifier.classify(word_feats(sentence)))
print(classifier.classify(word_feats(sentence2)))

for i, (feats, label) in enumerate(testfeats):
    refsets[label].add(i)
    observed = classifier.classify(feats)
    testsets[observed].add(i)

print('pos precision:', nltk.metrics.precision(refsets['pos'], testsets['pos']))
print('pos recall:', nltk.metrics.recall(refsets['pos'], testsets['pos']))
print('pos F-measure:', nltk.metrics.f_measure(refsets['pos'], testsets['pos']))
print('neg precision:', nltk.metrics.precision(refsets['neg'], testsets['neg']))
print('neg recall:', nltk.metrics.recall(refsets['neg'], testsets['neg']))
print('neg F-measure:', nltk.metrics.f_measure(refsets['neg'], testsets['neg']))
