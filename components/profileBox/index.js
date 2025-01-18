// Import zustand
import create from "zustand";

// Define the store using zustand
const useProfileStore = create((set) => ({
    profileName: "My Profile",
    isWhatsAppEnabled: false,
    is2FAEnabled: false,
    toggleWhatsApp: () => set((state) => ({ isWhatsAppEnabled: !state.isWhatsAppEnabled })),
    toggle2FA: () => set((state) => ({ is2FAEnabled: !state.is2FAEnabled })),
}));

// Original code structure
import { bottomsheetDashboard } from "../bottomsheet-modal/bottomsheet.js";
const mainWrapper = document.createElement("div");
const title = document.createElement("h2");
const profileBox = document.createElement("div");
const profileBoxHeader = document.createElement("div");
const profileBoxContent = document.createElement("div");
const profileBoxControls = document.createElement("div");
const profileBoxControlsContainer = document.createElement("div");
const profileBoxProfileImageHolder = document.createElement("div");
const profileBoxProfileImagePlaceholderHead = document.createElement("div");
const profileBoxProfileImagePlaceholderBase = document.createElement("div");
const profileBoxControlsContainerControlTitle = document.createElement("h4");
const wsSwitch = document.createElement("Label");
const wsSwitchCheck = document.createElement("input");
const wsSwitchSlider = document.createElement("span");

// Profile box controls for WhatsApp
const whatsappSwitch = document.createElement("input");
const whatsappSlider = document.createElement("span");
whatsappSwitch.classList = "checkbox";
whatsappSwitch.type = "checkbox";
whatsappSlider.classList = "slider round";
const whatsappCcontainer = document.createElement("div");
whatsappCcontainer.classList = "profileBoxControlsContainer";
const whatsappnot = document.createElement("h4");
const whatsappnotswitch = document.createElement("Label");
whatsappnot.innerText = "WhatsApp";
whatsappnotswitch.classList = "switch";
whatsappnotswitch.appendChild(whatsappSwitch);
whatsappnotswitch.appendChild(whatsappSlider);
whatsappCcontainer.appendChild(whatsappnot);
whatsappCcontainer.appendChild(whatsappnotswitch);

// Settings controls
const settingsControlHolder = document.createElement("div");
const s1 = document.createElement("div");
const s2 = document.createElement("div");
const s3 = document.createElement("div");
const s4 = document.createElement("div");
const s5 = document.createElement("div");
const s6 = document.createElement("div");
settingsControlHolder.classList = "settingsControlHolder";
s1.classList = "s1";
s2.classList = "s2";
s3.classList = "s3";
s4.classList = "s4";
s5.classList = "s5";
s6.classList = "s6";

// Switch control
wsSwitch.classList = "switch";
wsSwitchCheck.type = "checkbox";
wsSwitchSlider.classList = "slider round";

// Appends
wsSwitch.appendChild(wsSwitchCheck);
wsSwitch.appendChild(wsSwitchSlider);
settingsControlHolder.appendChild(s1);
settingsControlHolder.appendChild(s2);
settingsControlHolder.appendChild(s3);
settingsControlHolder.appendChild(s4);
settingsControlHolder.appendChild(s5);
settingsControlHolder.appendChild(s6);

// Props
profileBox.classList = "profileBox";
mainWrapper.classList = "mainWrapper";
title.classList = "title";
title.innerText = useProfileStore.getState().profileName; // Use state
profileBoxControlsContainer.classList = "profileBoxControlsContainer";
profileBoxControlsContainerControlTitle.classList = "profileBoxControlsContainerControlTitle";
profileBoxControlsContainerControlTitle.innerText = "2FA";
profileBoxProfileImageHolder.classList = "profileBoxProfileImageHolder";
profileBoxProfileImagePlaceholderHead.classList = "profileBoxProfileImagePlaceholderHead";
profileBoxProfileImagePlaceholderBase.classList = "profileBoxProfileImagePlaceholderBase";
profileBoxHeader.classList = "profileBoxHeader";
profileBoxControls.classList = "profileBoxControls";

// Control appends
profileBoxControlsContainer.appendChild(profileBoxControlsContainerControlTitle);
profileBoxControlsContainer.appendChild(wsSwitch);

// Create Box Function
export function createBox() {
    profileBoxProfileImageHolder.appendChild(profileBoxProfileImagePlaceholderHead);
    profileBoxProfileImageHolder.appendChild(profileBoxProfileImagePlaceholderBase);
    profileBoxHeader.appendChild(profileBoxProfileImageHolder);
    profileBoxHeader.appendChild(settingsControlHolder);
    profileBox.appendChild(profileBoxHeader);
    profileBoxControls.appendChild(profileBoxControlsContainer);
    profileBoxControls.appendChild(whatsappCcontainer);
    profileBox.appendChild(profileBoxControls);
    mainWrapper.appendChild(title);
    mainWrapper.appendChild(profileBox);

    // Bottomsheet
    bottomsheetDashboard(mainWrapper);

    // Add listeners for state changes
    wsSwitchCheck.addEventListener("change", () => {
        useProfileStore.getState().toggle2FA();
    });

    whatsappSwitch.addEventListener("change", () => {
        useProfileStore.getState().toggleWhatsApp();
    });

    // Subscribe to state changes
    useProfileStore.subscribe((state) => {
        title.innerText = state.profileName;
        wsSwitchCheck.checked = state.is2FAEnabled;
        whatsappSwitch.checked = state.isWhatsAppEnabled;
    });
}
