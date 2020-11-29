<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{label}}</title>
    <meta name="description" content="{{description}}">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>{{include(project/css/site.css}}</style>
    <meta property="og:title" content="{{label}}" />
    <meta property="og:description" content="{{description}}" />
    <meta property="og:image" content="{{url}}img/social.png?{{version}}" />
    <meta property="og:url" content="{{url}}" />
    <meta property="og:site_name" content="{{label}}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="{{twitter}}" />
    <meta name="twitter:image" content="{{url}}img/social.png?{{version}}" />
    <meta name="twitter:image:alt" content="{{label}}" />
    <meta name="google-site-verification" content="xmUT-cNYKa8IEPI8wCAf7q55PLPknSIEfN5g6puT7HU" />
    <meta name="google-site-verification" content="7vZlJKBsl3KZZRbJV474IyxJMXg64TYzSpAAoxO74-8" />
    <link rel="icon" href="img/favicon.png?{{version}}" type="image/png" />
</head>
<body>
    <header>
        <div class="wrapper">
            <h1>{{label}}</h1>
            <a class="twitter-share-button" data-show-count="false" href="https://twitter.com/share?ref_src=twsrc%5Etfw">Tweet</a>
            <script async="" charset="utf-8" src="https://platform.twitter.com/widgets.js"></script>
        </div>
    </header>
  <main>
    {{bookmarklet}}
    {{plugins}}    
  </main>
  <script>
  {{javascript}}
  </script>
</body>

</html>