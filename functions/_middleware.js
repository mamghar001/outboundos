export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Redirect apex -> www
  if (!url.hostname.startsWith('www.')) {
    const newUrl = new URL(context.request.url);
    newUrl.hostname = 'www.' + url.hostname;
    return Response.redirect(newUrl.toString(), 301);
  }
  return context.next();
}
