(() => {
  const clickTag = window.clickTag || 'https://example.com/landing';
  document.querySelectorAll('.ad__clickout').forEach((link) => {
    link.href = clickTag;
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startAnimation = () => document.documentElement.classList.add('is-playing');

  if (document.body.classList.contains('preview-page')) {
    const previewWidth = 1680;
    const previewHeight = 975;
    const stage = document.querySelector('#preview-stage');
    const frames = Array.from(stage.querySelectorAll('iframe'));

    let loadedFrames = 0;

    const resizePreview = () => {
      const scale = Math.min(window.innerWidth / previewWidth, window.innerHeight / previewHeight);
      stage.style.transform = `scale(${scale})`;
      stage.parentElement.style.width = `${previewWidth * scale}px`;
      stage.parentElement.style.height = `${previewHeight * scale}px`;
    };

    window.addEventListener('resize', resizePreview);
    resizePreview();

    if (reducedMotion) {
      return;
    }

    frames.forEach((frame) => {
      frame.addEventListener('load', () => {
        loadedFrames += 1;
        if (loadedFrames === frames.length) {
          frames.forEach((creative) => {
            creative.contentWindow.postMessage({ type: 'fireplace:start' }, '*');
          });
        }
      }, { once: true });
    });
    return;
  }

  if (reducedMotion || window.parent === window) {
    startAnimation();
    return;
  }

  window.addEventListener('message', (event) => {
    if (event.source === window.parent && event.data?.type === 'fireplace:start') {
      startAnimation();
    }
  });
})();
