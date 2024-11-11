# {% $id %} API {% badge %} {% $info.version %} {% /badge %}

## API Information for {% $info.title %}

{% markdown %}
{% $info.description %}
{% /markdown %}

{% if ($externalDocs) %}
{% link href=$externalDocs.url %}{% $externalDocs.description %}{% /link %}
{% /if %}

{% if ($info.termsOfService) %}
{% link href=$info.termsOfService %}TOC{% /link %}
{% /if %}
