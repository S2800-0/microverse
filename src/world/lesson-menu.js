// The lessons a world planner may choose from. Kept apart so the blueprint needs no simulation code.
export const LESSON_MENU=[['rain-and-plants','rain and plants, for land where plants depend on rainfall'],['warm-reef','warming water, for reefs and seas only'],['warm-pond','warming water and oxygen, for ponds and lakes'],['sharing-food','sharing limited food, for any world with a plant-eater']];
export const LESSON_IDS=LESSON_MENU.map(([id])=>id);
