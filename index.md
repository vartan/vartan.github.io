---
layout: page
title: Hello World!
tagline: Supporting tagline
---
{% include JB/setup %}
<div class="row">
  <style>
  .postdescription {
    text-align:left;
    text-align:justify;
  }
  .thumbnail img {
    height:200px !important;
    max-width:200px;
  }

  </style>
  {% for post in site.posts limit:3 %}
  <div class="col-sm-4">
    <hr class="visible-xs visible-sm"/>
  <p class="thumbnail">
    <a href="{{ BASE_PATH }}{{ post.url }}">
  {% if post.thumbnail %}
    <img src="{{ post.thumbnail }}" />
  {% else %}
    <img src="/images/placeholder-thumbnail-medium.png"/>
  {% endif %}
  </a>
</p>
  <h2>
    <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>
  </h2>
  <p class="postdescription">
                  <p><code>{{ post.date | date_to_long_string }}</code></p>
  {{ post.content | strip_html | truncatewords:80 }}
  </p>
  <p>
  <a class="btn btn-primary" href="{{ BASE_PATH }}{{ post.url }}">Read more...</a>
  </p>
  </div>
  {% endfor %}
</div>

{% for post in site.posts limit:15 offset:3 %}
<hr />
<div class="row">
  <div class="col-sm-4 col-md-3 ">
</div>
<div class="col-sm-8 col-md-9">
  <p><h2><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a> <small>{{ post.tagline }}</small></h2></p>
</div>
<div class="col-sm-4 col-md-3 thumbnail">
  <a href="{{ BASE_PATH }}{{ post.url }}">
  {% if post.thumbnail %}
    <img src="{{ post.thumbnail }}" />
  {% else %}
    <img src="/images/placeholder-thumbnail-medium.png"/>
  {% endif %}
</a>
  </div>
  <div class="col-sm-8 col-md-9">
  <p><code>{{ post.date | date_to_long_string }}</code></p>

  <p>
    {{ post.content | strip_html | truncatewords: 150 }}
  </p>
  <p>
  <a class="btn btn-primary" href="{{ BASE_PATH }}{{ post.url }}">Read more...</a>
  </p>
  </div>
</div>
{% endfor %}
