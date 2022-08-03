
import config from "../config/configuration.js";

(async function () {
  if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
    sessionStorage.removeItem("conversationId");
  }

  // ====== direct line token
  const secret = config.secret_token;

  let token = "";
  let conversationId = sessionStorage.getItem("conversationId");
  let store = null;

  if (!conversationId) {
    // generate token and conversation
    const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      method: 'POST'
    });
    const result = await res.json();
    token = result.token
    sessionStorage.setItem("conversationId", result.conversationId);
  } else {
    // reconnect conversation
    const res = await fetch(`https://directline.botframework.com/v3/directline/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`,
      },
    });

    const result = await res.json();
    token = result.token
  }

  // ============== Store for send messages to bot and Welcome message 
  if (!conversationId) {
    // if theres not conversation, save new store
    store = window.WebChat.createStore(
      {},
      ({ dispatch }) => next => action => {

        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({ type: 'WEB_CHAT/SEND_EVENT', payload: { name: 'webchat/join', value: { language: window.navigator.language } } });
        }

        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const event = new Event('incomingActivity');
          event.data = action.payload.activity;
          window.dispatchEvent(event);
        }

        return next(action);
      }
    );
  }


  // ============== Events handler from direct line
  window.addEventListener('incomingActivity', ({ data }) => {
    let type = data.type;

    // ============== Event to delete messages     
    if (type === 'event') {
      if (data.channelData.data === 'disableButtons') {

        Array.from(document.getElementsByClassName("ac-pushButton")).forEach(element => {

          // ===== Disable
          element.disabled = 'none';
          element.style.backgroundColor = "lightgrey";

        });
      }
    }

    // ============== Event to delete messages     
    if (type === 'event') {
      if (data.channelData.data === 'deleteMessages') {

        // =============== Delete certain number of messages
        my_array = Array.from(document.getElementsByClassName("css-604azu css-10xzw44 webchat__stacked_indented_content"));
        for (let j = 0; j < data.channelData.nDel; j++) {
          if (j < my_array.length) {
            let last_element = my_array[my_array.length - 1 - j];
            last_element.remove();
          }
        };
      }
    }
  });

  // ============== Font set function
  function fontFamily(fonts) {
    return fonts.map(font => `'${font}'`).join(', ');
  }

  // ============== Bot style options
  const styleOptions = {
    primaryFont: fontFamily([`${config.font_name}`, 'Arial', 'Helvetica', 'sans-serif']),
    botAvatarImage: `../intebot/icons/${config.bot_avatar}`,
    userAvatarImage: `../intebot/icons/${config.user_avatar}`,
    botAvatarBackgroundColor: config.bot_avatar_background,
    userAvatarBackgroundColor: config.user_avatar_background,
    hideSendBox: false,
    hideUploadButton: false,
    sendBoxTextWrap: true
  };

  // ============== WebChat Render
  let data = {
    directLine: window.WebChat.createDirectLine({ token }),
    styleOptions
  }

  if (!conversationId) {
    data.store = store
  }
  window.WebChat.renderWebChat(data, document.getElementById('inteBot'));

  document.querySelector('#inteBot > *').focus();

  // ======== Send icon replacement whether exist Attachment icon
  const parent = document.getElementsByClassName('main');
  const childSend = parent[0].children[2].getElementsByTagName('svg');
  const imgSend = document.createElement("img");
  imgSend.src = `../intebot/icons/${config.send_button}`;
  childSend[0].replaceWith(imgSend);

  // ======== Replace SendBox placeHolder
  const sendBox = document.getElementsByClassName('webchat__send-box-text-box__text-area');
  sendBox[0].placeholder = 'Escriba aquí su pregunta';

  // ======== Burger menu button creation
  var newDiv = document.createElement("button");

  var att = document.createAttribute("class");
  att.value = "css-1ueqw9g webchat__icon-button";
  newDiv.setAttributeNode(att);

  att = document.createAttribute("title");
  att.value = "Menú";
  newDiv.setAttributeNode(att);

  att = document.createAttribute("type");
  att.value = "button";
  newDiv.setAttributeNode(att);

  // ======== Add image to button
  var newImg = document.createElement("img");

  var inImg = document.createAttribute("src");
  inImg.value = "../intebot/icons/SandwichMenu.jpg";
  newImg.setAttributeNode(inImg);

  newDiv.appendChild(newImg);
  newDiv.onclick = () => {
    // ========== Send a message without show in chat    
    store.dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: 'menú' } });
  }

  //======== Button replace
  var button = document.getElementsByClassName("css-1ueqw9g webchat__icon-button")[0];
  button.replaceWith(newDiv);


  //* set CSS variables
  document.documentElement.style.setProperty(`--header-bg`, config.header_color);
  document.documentElement.style.setProperty(`--chat-button`, `url('${config.img_src}${config.chat_button}')`);
  document.documentElement.style.setProperty(`--close-button`, `url('${config.img_src}${config.close_button}')`);
  document.documentElement.style.setProperty(`--font-name`, `'${config.font_name}'`);
  document.documentElement.style.setProperty(`--font-src`, `url('${config.font_src}')`);

  //* add css styles
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = config.css_src;
  document.body.appendChild(link);

  //* add image and title on header
  document.getElementById("image-header").src = `./icons/${config.bot_avatar}`
  document.getElementById("title-header").textContent = config.title_header;

})().catch(err => console.error(err));