class ViewSDKClient {
  constructor() {
    this.readyPromise = new Promise((resolve) => {
      if (window.AdobeDC) {
        resolve();
      } else {
        document.addEventListener("adobe_dc_view_sdk.ready", () => {
          resolve();
        });
      }
    });
    this.adobeDCView = undefined;
  }

  ready() {
    return this.readyPromise;
  }

  previewFile(divId, viewerConfig, url, setNewAnnotations) {
    const config = {
      // clientId: "d3c644fbd03e48ea8b592b78c42afe41", //enter local client id here 
      clientId: "6454c8a765d64f8797872973904d5f2a", //enter dev client id here 
    };
    if (divId) {
      config.divId = divId;
    }
    this.adobeDCView = new window.AdobeDC.View(config);
    const previewFilePromise = this.adobeDCView.previewFile(
      {
        content: {
          location: {
            url,
          },
        },
        metaData: {
          fileName: url.slice(42), // Taking name of the file from the url
          id: "6d07d124-ac85-43b3-a867-36930f502ac6",
        },
      },
      viewerConfig
    );
    const profile = {
      userProfile: {
          name: localStorage.getItem('fullName'),
          // firstName: ,
          // lastName: ,
      }
    };
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API,
      function() {
         return new Promise((resolve, reject) => {
            resolve({
               code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
               data: profile
            });
         });
      },
   {});
    this.adobeDCView.registerCallback(
      window.AdobeDC.View.Enum.CallbackType.SAVE_API,
      async function (metaData, content, options) {
        console.log("inside register callback")
        try {
           await previewFilePromise.then(adobeViewer => {
            adobeViewer.getAnnotationManager().then(annotationManager => {
              annotationManager.getAnnotations()
                .then(result => {
                  setNewAnnotations(result)
                  console.log('annotation:', result)
                }
                )
                .catch(error => console.log(error));
            });
          });
        } catch (e) {
          console.log(e)
        }



        return new Promise((resolve, reject) => {
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
    this.adobeDCView = new window.AdobeDC.View({
      // clientId: "d3c644fbd03e48ea8b592b78c42afe41", //enter local Client id here
      clientId: "6454c8a765d64f8797872973904d5f2a", //enter dev Client id here
      divId,
    });
    this.adobeDCView.previewFile(
      {
        content: {
          promise: filePromise,
        },
        metaData: {
          fileName: fileName,
        },
      },
      {}
    );
  }

  registerSaveApiHandler() {
    const saveApiHandler = (metaData, content, options) => {
      console.log("save", metaData, content, options);
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = {
            code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
            data: {
              metaData: Object.assign(metaData, {
                updatedAt: new Date().getTime(),
              }),
            },
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
        enablePDFAnalytics: true,
      }
    );
  }
}
export default ViewSDKClient;