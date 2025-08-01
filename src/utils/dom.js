function downloadFile(url) {
  // 创建隐藏的<a>标签
  const linkTag = document.createElement('a')
  linkTag.style.display = 'none';
  linkTag.href = url
  linkTag.target = '_blank';
  document.body.appendChild(linkTag)
  linkTag.click()
  document.body.removeChild(linkTag)
}

export {downloadFile}
