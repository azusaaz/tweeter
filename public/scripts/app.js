/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */
$(document).ready(function () {

  //////// Event listeners ////////

  //slide toggle the new tweet window
  $(".nav-button").on('click', function () {
    if ($("#new-tweet").is(':visible')) {
      $("#new-tweet").slideUp();

    } else {
      $("#new-tweet").slideDown();
      $("#new-tweet textarea").focus();

    }
  });

  //when clicked tweet button
  $("form").on('submit', function (event) {

    event.preventDefault();
    // console.log("serial",$( this ).serialize());

    if ($(this).find("textarea").val().length === 0) {
      $('#error').html("Please input something");
      $('#error').slideDown();

    } else if ($(this).find("textarea").val().length > 140) {
      $('#error').html("Cannot tweet more than 140 letters");
      $('#error').slideDown();

    } else {

      var $text = $(this).find("textarea");

      $.ajax({
          // url: 'http://localhost:8080/tweets',
          url: 'https://gentle-chamber-94500.herokuapp.com/tweets',
          method: 'POST',
          data: $(this).serialize(),
        })
        .done(function (data, status, response) {

          if (response.status === 503) {
            alert("something wrong");
          }
          if (response.status === 201) {
            $('#tweets-container').empty();
            $text.val("");
            $("#counter").html(140);
            loadTweets();
          }
        });
    }
  });



  //////// helper functions ////////

  function escape(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function howLongAgo(pastTimePoint) {

    var secGap = (Date.now() - pastTimePoint) / 1000;
    var ago;
    if (secGap < 59) {
      ago = Math.floor(secGap);
      (ago === 0) ? ago = 'A while ago':
        (ago === 1) ? ago += ' second ago' : ago += ' seconds ago';

    } else if (secGap < 3599) {
      ago = Math.floor(secGap / 60);
      (ago === 1) ? ago += ' minute ago': ago += ' minutes ago';

    } else if (secGap < 86399) {
      ago = Math.floor(secGap / 3600);
      (ago === 1) ? ago += ' hour ago': ago += ' hours ago';

    } else if (secGap < 2591999) {
      ago = Math.floor(secGap / 86400);
      (ago === 1) ? ago += ' day ago': ago += ' days ago';

    } else if (secGap < 31535999) {
      ago = Math.floor(secGap / 2592000);
      (ago === 1) ? ago += ' month ago': ago += ' months ago';

    } else {
      ago = Math.floor(secGap / 31536000);
      (ago === 1) ? ago += ' year ago': ago += ' years ago';
    }

    return ago;
  }

  //////// main functions ////////

  function toggleIcon(data, icon){

    let tmp = data.content[icon][data.user.handle];

    if(tmp){
       // toggle like
       tmp = !tmp
    }else{
       // create new record;
       tmp = true;
    }
  }

  function createTweetElement(data) {

    var text =
      `<article class="tweet">

      <header class="between">
        <div class= "between">

          <div class="img-container">
            <img src="${data.user.avatars.small}" alt="">
          </div>

          <div id="names" class= "between">
            <h2>${data.user.name}</h2>
            <h4 class="handle">${data.user.handle}</h4>
          </div>

        </div>  
      </header>

      <div class="comment">
        <h4 class="say">${escape(data.content.text)}</h4>  
      </div>

      <footer class="between">
        <h5>${howLongAgo(data.created_at)}</h5>

        <div id="icons" class="row">
        
         <div class="row">
          <div><i class="icon-flag def"></i></div>      
          <div><i class="icon-retweet def"></i></div>
         </div>

         <div>
          <div><i class="icon-heart def" data-like = '0' ><span> 0 </span></i></div> 
          </div>
        </div>

      </footer>

    </article>`;

    return text;
  }

  function renderTweets(tweets) {
    let newTweets = tweets.reverse();
    for (let tweetData of newTweets) {
      var $tweet = createTweetElement(tweetData);
      $('#tweets-container').append($tweet);
    }
  }

  function loadTweets() {

    // $.ajax('http://localhost:8080/tweets', {
    $.ajax('https://gentle-chamber-94500.herokuapp.com/tweets', {
        method: 'GET'
      })
      .done(function (tweetsHtml) {
        renderTweets(tweetsHtml);

        //// listener for "flag" ////
        $(".icon-flag").on('click', function () {
          $(this).toggleClass("flag-on");
        });

        //// listener for "retweet" ////
        $(".icon-retweet").on('click', function () {
          $(this).addClass("retweet-on");
          $("html").animate({
            scrollTop: $("#new-tweet")
          }, "slow");
          $("#new-tweet").slideDown();
          $("#new-tweet textarea").focus();

          // get handle name & comment
          $("#new-tweet textarea").val(`${$(this).parent().parent().parent().parent().parent().find(".handle").text()} ${$(this).parent().parent().parent().parent().parent().find(".say").text()} /// `);

          $("#new-tweet textarea").trigger("keyup");
          $(this).on("mouseleave", function () {
            $(this).removeClass("retweet-on")
          });
        });

        //// listener for "like" ////
        $("#icons .icon-heart").on('click', function () {
          $(this).addClass("heart-on");
          var tmp = $(this).data('like');
          $(this).data('like', tmp += 1);
          $(this).html(` ${$( this ).data('like')} `);
        });
      });
  }

  loadTweets();

});