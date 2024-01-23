import config from "../config/configuration.js";
//It's important to first add the css file to html to show the bubble button
let link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = config.css_src;
document.body.appendChild(link);

//========= Conect chat to bot when the button is clicked
const buttonBubble = document.querySelector(".buttonBubble");
//we add the image to the button so it can be seen
buttonBubble.style.backgroundImage = `url('${config.img_src}${config.chat_button}')`;
//when the button is clicked, the chat is connected to the bot
buttonBubble.addEventListener("click", connectChatToBot);

async function getDirectLineActions(type) {
    const secret = config.secret_token;

    let url = "";

    switch (type) {
        case "getToken":
            url =
                "https://directline.botframework.com/v3/directline/tokens/generate";
            break;
        default:
            break;
    }

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${secret}`,
        },
        method: "POST",
    });
    let result = await res.json();
    return result;
}

async function connectChatToBot() {
    let token = "";
    // ====== Create store
    let store = window.WebChat.createStore({}, ({ dispatch }) => (next) => (action) => {
        if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
            dispatch({
                type: "WEB_CHAT/SEND_EVENT",
                payload: {
                    name: "webchat/join",
                    value: { language: window.navigator.language },
                },
            });
        }
        return next(action);
    });
    // ====== get direct line token
    let result = await getDirectLineActions("getToken");
    token = result.token;
    // ============== Font set function
    function fontFamily(fonts) {
        return fonts.map((font) => `'${font}'`).join(", ");
    }

    // ============== Bot style options
    const styleOptions = {
        primaryFont: fontFamily([
            `${config.font_name}`,
            "Arial",
            "Helvetica",
            "sans-serif",
        ]),
        botAvatarImage: `${config.img_src}${config.bot_avatar}`,
        userAvatarImage: `${config.img_src}${config.user_avatar}`,
        botAvatarBackgroundColor: config.bot_avatar_background,
        userAvatarBackgroundColor: config.user_avatar_background,
        hideSendBox: false,
        hideUploadButton: false,
        sendBoxTextWrap: true,
        backgroundColor: config.chat_background,
    };

    // ============== WebChat Render
    let data = {
        directLine: window.WebChat.createDirectLine({ token }),
        styleOptions,
        store,
    };
    window.WebChat.renderWebChat(data, document.getElementById("inteBot"));

    document.querySelector("#inteBot > *").focus();

    // ======== Send icon replacement whether exist attachment icon
    const parent = document.getElementsByClassName("main");
    const childSend = parent[0].children[2].getElementsByTagName("svg");
    const imgSend = document.createElement("img");
    imgSend.src = `${config.img_src}${config.send_button}`;
    childSend[0].replaceWith(imgSend);

    // ======== Replace SendBox placeHolder
    const sendBox = document.getElementsByClassName(
        "webchat__send-box-text-box__text-area"
    );
    sendBox[0].placeholder = "Escriba aquí su pregunta";

    // ======== Burger menu button creation
    let newDiv = document.createElement("button");

    let att = document.createAttribute("class");
    att.value = "css-1ueqw9g webchat__icon-button";
    newDiv.setAttributeNode(att);

    att = document.createAttribute("title");
    att.value = "Menú";
    newDiv.setAttributeNode(att);

    att = document.createAttribute("type");
    att.value = "button";
    newDiv.setAttributeNode(att);

    // ======== Add image to button
    let newImg = document.createElement("img");

    let inImg = document.createAttribute("src");
    inImg.value = `${config.img_src}${config.menu_button}`;
    newImg.setAttributeNode(inImg);

    newDiv.appendChild(newImg);
    newDiv.onclick = () => {
        // ========== Send a message without show in chat
        store.dispatch({
            type: "WEB_CHAT/SEND_MESSAGE",
            payload: { text: "menú" },
        });
    };

    //======== Button replace
    let button = document.getElementsByClassName(
        "css-1ueqw9g webchat__icon-button"
    )[0];
    button.replaceWith(newDiv);

    //* Set CSS variables
    document.documentElement.style.setProperty(
        `--header-bg`,
        config.header_color
    );
    document.documentElement.style.setProperty(
        `--chat-button`,
        `url('../icons/${config.chat_button}')`
    );
    document.documentElement.style.setProperty(
        `--close-button`,
        `url('../icons/${config.close_button}')`
    );
    document.documentElement.style.setProperty(
        `--font-name`,
        `${config.font_name}, Arial, Helvetica, sans-serif`
    );
    document.documentElement.style.setProperty(`--font-size`, config.font_size);
    document.documentElement.style.setProperty(`--btn-color`, config.btn_color);
    document.documentElement.style.setProperty(
        `--text-header-color`,
        config.text_header_color
    );
    document.documentElement.style.setProperty(`--header_bg_color`, config.header_bg_color);

    //* Add font family */
    document.fonts.add(
        new FontFace(config.font_name, `url(${config.font_src})`)
    );

    //* Add image and title on header
    document.getElementById(
        "image-header"
    ).src = `${config.img_src}${config.header_avatar}`;
    document.getElementById("title-header").textContent = config.title_header;
    document.getElementById("chat-powered").style = null;
    
}