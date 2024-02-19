import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
// import * as moment from 'moment';

@Injectable()
@NgModule()
export class Extensions {

  constructor() {
    
  }

  calendarTime(input : String) {
    if(!input) {
      return ""
    }

    let year = input.slice(0,4);
    let month = input.slice(4,6);
    let day = input.slice(6,8);

    if(month == "01") { month = "January" }
    else if(month == "02") { month = "February" }
    else if(month == "03") { month = "March" }
    else if(month == "04") { month = "April" }
    else if(month == "05") { month = "May" }
    else if(month == "06") { month = "June" }
    else if(month == "07") { month = "July" }
    else if(month == "08") { month = "August" }
    else if(month == "09") { month = "September" }
    else if(month == "10") { month = "October" }
    else if(month == "11") { month = "November" }
    else if(month == "12") { month = "December" }

    return month + " " + day + ", " + year;
  }


  timeStamp() : string {
    let date = new Date();

    let timeStamp = date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate());

      function pad(n : number) {
          return (n < 10) ? ("0" + n) : n;
      }

      return timeStamp;
  }

  timeStampWithSeconds() : string {
    let date = new Date();

    let timeStamp = date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());

      function pad(n : number) {
          return (n < 10) ? ("0" + n) : n;
      }

      return timeStamp;
  }

  // timeStampMinusDays(input : number) : string {
  //   let date = new Date();
  //   return moment(date).subtract(input, 'days').format('YYYYMMDD');
  // }

  convertStripeTimestamp(input : number) : Date {

    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(input * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return date

  }

  stopWords = ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thick", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

  stopWord(s : string) : Boolean {
    for(let w of this.stopWords) {
      if(w == s) {
        return true;
      }
    }
    return false;
  }

  isAlphaNumeric(str : string) {
    if(!str || str == "") { return false }
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
  };

  isAlphaNumericWithSpaces(str : string) {
    if(!str || str == "") { return false }
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) && code != 32) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
  };

  isAlphaNumericWithSpacesAndDashes(str : string) {
    if(!str || str == "") { return false }
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) && code != 32 && code != 45) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
  };

}
