---
layout: page
title: Michael Vartan
tagline: Tinkerings and Tutorials
---
{% include JB/setup %}
<div class="row">
  <style>
  .postdescription {
    text-align:left;
    text-align:justify;
  }
  .thumbnail {
    min-height:200px;
    line-height:200px;
    text-align:center !important;

  }
  .thumbnail img {
    max-height:200px !important;
    max-width:200px;
    display:inline-block;
    text-align:center !important;
   display: inline-block !important;
    vertical-align: middle !important;
  }

  </style>
  {% for post in site.posts limit:3 %}
  <div class="col-sm-4">
    <hr class="visible-xs visible-sm"/>
    <a class="thumbnail"href="{{ BASE_PATH }}{{ post.url }}">
  {% if post.thumbnail %}
    <img src="{{ post.thumbnail }}"/>
  {% else %}
    <img src="/images/placeholder-thumbnail-medium.png"/>
  {% endif %}
  </a>
  <h2>
    <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>
  </h2>
  <p class="postdescription">
                  <small><code>{{ post.date | date_to_long_string }}</code></small>
  {{ post.content | strip_html | truncatewords:80 }}
  </p>
  <p>
  <a class="btn btn-primary" href="{{ BASE_PATH }}{{ post.url }}">Read more...</a>
  </p>
  </div>
  {% endfor %}
</div>
<hr/>
<div class="row">
<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- Responsive-Schejoule -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7388947224467540"
     data-ad-slot="6925392360"
     data-ad-format="auto"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>
</div>

{% for post in site.posts limit:15 offset:3 %}
<hr/>
<div class="row">
  <div class="col-sm-4 col-md-3 ">
</div>
<div class="col-sm-8 col-md-9">
  <p><h2><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a> <small>{{ post.tagline }}</small></h2></p>
</div>
<div class="col-sm-4 col-md-3">
  <a href="{{ BASE_PATH }}{{ post.url }}" class="thumbnail">
  {% if post.thumbnail %}
    <img src="{{ post.thumbnail }}" />
  {% else %}
    <img src="/images/placeholder-thumbnail-medium.png"/>
  {% endif %}
</a>
  </div>
  <div class="col-sm-8 col-md-9">
  <p>
      <small><code>{{ post.date | date_to_long_string }}</code></small>

    {{ post.content | strip_html | truncatewords: 150 }}
  </p>
  <p>
  <a class="btn btn-primary" href="{{ BASE_PATH }}{{ post.url }}">Read more...</a>
  </p>
  </div>
</div>
{% endfor %}
