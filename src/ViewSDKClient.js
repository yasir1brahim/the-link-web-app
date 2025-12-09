import { validateS3Link, isS3LinkExpiredError } from './utils/s3LinkValidator.js';

class ViewSDKClient {
  constructor() {
    this.readyPromise = new Promise((resolve) => {
      if (window.AdobeDC) {
        resolve();
      } else {
        document.addEventListener('adobe_dc_view_sdk.ready', () => {
          resolve();
        });
      }
    });
    this.adobeDCView = undefined;
  }

  ready() {
    return this.readyPromise;
  }

  async previewFile(divId, viewerConfig, url, setNewAnnotations, onError) {
    // Simple S3 validation
    try {
      const isValid = await validateS3Link(url);
      if (!isValid) {
        onError && onError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        return Promise.reject(new Error('Link expired'));
      }
    } catch (error) {
      console.log('S3 validation failed, continuing with PDF load');
    }

    const clientId = window.location.href.includes('https://app.thelink.ai')
      ? 'f59bde8fafcd4dcba42ebed3acbaa23f'
      : window.location.href.includes('localhost')
      ? 'd3c644fbd03e48ea8b592b78c42afe41'
      : '6454c8a765d64f8797872973904d5f2a';
    
    const config = { clientId };
    if (divId) {
      config.divId = divId;
    }
    
    this.adobeDCView = new window.AdobeDC.View(config);
    
    const previewFilePromise = this.adobeDCView.previewFile(
      {
        content: {
          location: { url }
        },
        metaData: {
          fileName: url.slice(42),
          id: '6d07d124-ac85-43b3-a867-36930f502ac6'
        }
      },
      viewerConfig
    );

    // Error handling
    previewFilePromise.catch((error) => {
      if (isS3LinkExpiredError(error)) {
        onError && onError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
      } else {
        onError && onError({ message: 'Unable to load the PDF document. Please try again.' });
      }
    });

    const profile = {
      userProfile: {
        name: localStorage.getItem('fullName')
      }
    };
    
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API,
      function () {
        return new Promise((resolve) => {
          resolve({
            code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
            data: profile
          });
        });
      },
      {}
    );
    
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.SAVE_API,
      async function (metaData, content, options) {
        try {
          await previewFilePromise.then((adobeViewer) => {
            adobeViewer.getAnnotationManager().then((annotationManager) => {
              annotationManager
                .getAnnotations()
                .then((result) => {
                  setNewAnnotations(result);
                })
                .catch((error) => console.log(error));
            });
          });
        } catch (error) {
          console.log(error);
        }

        return new Promise((resolve) => {
          resolve({
            code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
            data: {
              metaData: { fileName: url.slice(42) }
            }
          });
        });
      },
      {
        autoSaveFrequency: 0,
        enableFocusPolling: false,
        showSaveButton: true
      }
    );
    
    return previewFilePromise;
  }

  previewFileUsingFilePromise(divId, filePromise, fileName) {
    const clientId = window.location.href.includes('https://app.thelink.ai')
      ? 'f59bde8fafcd4dcba42ebed3acbaa23f'
      : window.location.href.includes('https://thelink.knyapps.com')
      ? 'd3c644fbd03e48ea8b592b78c42afe41'
      : window.location.href.includes('localhost')
      ? 'd3c644fbd03e48ea8b592b78c42afe41'
      : '6454c8a765d64f8797872973904d5f2a';
    
    this.adobeDCView = new window.AdobeDC.View({
      clientId,
      divId
    });
    
    this.adobeDCView.previewFile(
      {
        content: {
          promise: filePromise
        },
        metaData: {
          fileName: fileName
        }
      },
      {}
    );
  }

  registerSaveApiHandler() {
    const saveApiHandler = (metaData, content, options) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = {
            code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
            data: {
              metaData: Object.assign(metaData, {
                updatedAt: new Date().getTime()
              })
            }
          };
          resolve(response);
        }, 2000);
      });
    };
    
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.SAVE_API,
      saveApiHandler,
      {}
    );
  }

  registerEventsHandler() {
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
      (event) => {
        console.log(event);
      },
      {
        enablePDFAnalytics: true
      }
    );
  }
}

export default ViewSDKClient;
