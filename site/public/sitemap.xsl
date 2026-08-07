<?xml version="1.0" encoding="UTF-8"?>
<!--
  Makes the sitemap readable in a browser.

  A sitemap is XML with no line breaks, so opening it shows one long run of
  text and looks broken even when it validates. Crawlers ignore this stylesheet
  entirely; it exists so a person can check the list at a glance.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Mapa del sitio | Campus</title>
        <style>
          :root { color-scheme: light; }
          body {
            margin: 0;
            padding: 48px 24px;
            background: #f4f8f8;
            color: #17323f;
            font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
          }
          .shell { max-width: 900px; margin: 0 auto; }
          h1 { margin: 0 0 6px; font-size: 26px; letter-spacing: -.01em; }
          .lede { margin: 0 0 28px; color: #506d7f; }
          .lede a { color: #2b776b; }
          .count {
            display: inline-block;
            margin-bottom: 20px;
            padding: 4px 10px;
            border-radius: 999px;
            background: #e4f0ec;
            color: #2b776b;
            font-size: 13px;
            font-weight: 700;
          }
          .wrap { overflow-x: auto; border: 1px solid #dfeaee; border-radius: 8px; background: #fff; }
          table { width: 100%; border-collapse: collapse; font-size: 15px; }
          th, td { padding: 11px 14px; border-bottom: 1px solid #eef4f6; text-align: left; vertical-align: top; }
          th {
            color: #7d97a5;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            white-space: nowrap;
          }
          tr:last-child td { border-bottom: 0; }
          td a { color: #17323f; text-decoration: none; }
          td a:hover { color: #2b776b; text-decoration: underline; }
          .date { color: #506d7f; font-variant-numeric: tabular-nums; white-space: nowrap; }
        </style>
      </head>
      <body>
        <div class="shell">
          <h1>Mapa del sitio</h1>
          <p class="lede">
            Lista de páginas de <a href="https://campuscli.com/">campuscli.com</a>.
            Esta vista es solo para leerla; los buscadores consumen el XML directamente.
          </p>

          <!--
            Two documents share this stylesheet. The index (<sitemapindex>)
            lists the numbered sitemaps; each of those (<urlset>) lists the
            pages. Handling only one of them renders the other as an empty
            table that reads as a broken sitemap.
          -->
          <xsl:apply-templates select="s:sitemapindex" />
          <xsl:apply-templates select="s:urlset" />
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- The index: one row per sitemap file. -->
  <xsl:template match="s:sitemapindex">
    <span class="count">
      <xsl:value-of select="count(s:sitemap)" />
      <xsl:text> </xsl:text>
      <xsl:choose>
        <xsl:when test="count(s:sitemap) = 1">mapa</xsl:when>
        <xsl:otherwise>mapas</xsl:otherwise>
      </xsl:choose>
    </span>
    <p class="lede">
      Este es el índice. Cada entrada es un mapa con la lista real de páginas.
    </p>
    <div class="wrap">
      <table>
        <tr>
          <th>Mapa</th>
          <th>Última modificación</th>
        </tr>
        <xsl:for-each select="s:sitemap">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
            <td class="date"><xsl:value-of select="substring(s:lastmod, 1, 10)" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>

  <!-- A sitemap: one row per page. -->
  <xsl:template match="s:urlset">
    <span class="count">
      <xsl:value-of select="count(s:url)" />
      <xsl:text> </xsl:text>
      <xsl:choose>
        <xsl:when test="count(s:url) = 1">página</xsl:when>
        <xsl:otherwise>páginas</xsl:otherwise>
      </xsl:choose>
    </span>
    <div class="wrap">
      <table>
        <tr>
          <th>Dirección</th>
          <th>Última modificación</th>
        </tr>
        <xsl:for-each select="s:url">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
            <td class="date"><xsl:value-of select="substring(s:lastmod, 1, 10)" /></td>
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>
</xsl:stylesheet>
