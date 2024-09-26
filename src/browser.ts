export function injectCSS(
  code: string,
  container?: string | Element,
  tagSelector?: string,
) {
  const head = document.getElementsByTagName('head')[0];
  let styleTag = document.querySelector(`style${tagSelector ?? ''}`);
  if (!styleTag) {
    styleTag = document.createElement('style');
    // @ts-expect-error
    styleTag.type = 'text/css';
    // @ts-expect-error
    styleTag.rel = 'stylesheet';
  }
  try {
    styleTag.innerHTML = '';
    //for Chrome Firefox Opera Safari
    styleTag.appendChild(document.createTextNode(code));
  } catch (ex) {
    //for IE
    // @ts-expect-error
    styleTag.styleSheet.cssText = code;
  }
  if (typeof container === 'string' && document.getElementById(container)) {
    document.getElementById(container)!.appendChild(styleTag);
  } else if (container instanceof Element) {
    container.appendChild(styleTag);
  } else {
    head.appendChild(styleTag);
  }

  return styleTag;
}

export function getBase64FromImgFile(img: File, callback: (base64Url: string) => void) {
  const promise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = reader.result as string;
      resolve(result);
      return callback(result);
    });
    reader.readAsDataURL(img);
  });
  return promise;
}

export function getBase64FromImgEl(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, img.width, img.height);
  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
}

export function loadImgEl(url: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = document.createElement('img');
    img.src = url; //此处自己替换本地图片的地址
    img.crossOrigin = 'anonymous';
    img.setAttribute('style', 'position:absolute;display:none;');
    img.onload = function () {
      resolve(img);
      img.remove();
    };
    document.body.appendChild(img);
  });
}

export function getBase64FromUrl(url: string) {
  return loadImgEl(url).then((img) => getBase64FromImgEl(img));
}

export const Base64Util = {
  stringfy: function encode(str: string) {
    // 对字符串进行编码
    const encode = encodeURI(str);
    // 对编码的字符串转化base64
    const base64 = btoa(encode);
    return base64;
  },
  parse: function decode(base64: string) {
    // 对base64转编码
    const decode = atob(base64);
    // 编码转字符串
    const str = decodeURI(decode);
    return str;
  },
};

export function injectScriptFile(url: string) {
  if (!url || document.getElementById(url)) return;
  document.addEventListener('DOMContentLoaded', function () {
    // 创建 script 元素
    const scriptElement = document.createElement('script');
    scriptElement.src = url;
    scriptElement.setAttribute('id', url);
    // 将 script 元素添加到页面的 head 或 body 元素中
    document.head.appendChild(scriptElement);
    // 或 document.body.appendChild(scriptElement);
  });
}

export function injectCSSFile(url: string) {
  if (!url || document.getElementById(url)) return;
  document.addEventListener('DOMContentLoaded', function () {
    // 创建 link 元素
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.href = url;
    linkElement.setAttribute('id', url);
    // 将 link 元素添加到页面的 head 元素中
    document.head.appendChild(linkElement);
  });
}

export function downloadBase64(base64data: string, width: number, height: number) {
  const image = new Image();
  image.src = base64data;
  image.onload = function () {
    const canvas = convertImageToCanvas(image, width, height);
    const url = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    const event = new MouseEvent('click');
    a.download = new Date().getTime() + '.jpg'; // 指定下载图片的名称
    a.href = url;
    a.dispatchEvent(event); // 触发超链接的点击事件
  };
}

export function convertImageToCanvas(
  image: CanvasImageSource,
  width: number,
  height: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width || document.body.clientWidth;
  canvas.height = height || document.body.clientHeight;
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function querySelector(
  selector: string,
  cb: (el: Element | null) => void,
  target: Element,
) {
  const parent = target || document;
  const el = parent.querySelector(selector);
  cb?.(el);
}

export function querySelectorAll(
  selector: string,
  cb: (R: Element) => void,
  target: HTMLElement,
) {
  const parent = target || document;
  const els = parent.querySelectorAll(selector);
  for (const el of els) {
    cb?.(el);
  }
}
