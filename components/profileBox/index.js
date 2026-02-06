// Import zustand
import styles from './index.module.css';
import { create } from "zustand";
// Define the store using zustand
const useProfileStore = create((set) => ({
    profileName: "My Profile",
    isWhatsAppEnabled: false,
    is2FAEnabled: false,
    toggleWhatsApp: () => set((state) => ({ isWhatsAppEnabled: !state.isWhatsAppEnabled })),
    toggle2FA: () => set((state) => ({ is2FAEnabled: !state.is2FAEnabled })),
}));

//  Function
//construct profileBox on demand with random id and event controller attached
export function profileBox(module,eventId) {
    const profileBoxWrapper = document.createElement("div");
const profileBox = document.createElement("div");
const profileBoxImg = document.createElement("img");

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
