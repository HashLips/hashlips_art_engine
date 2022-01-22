const { combinationOfTraitsAlreadyExists } = require('./combination_traits');
const {
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall,
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisMedium,
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisLarge,
  BackgroundBlack_EyeballRed_EyecolorRed_IrisLarge,
} = require('../__fixtures__/traits');

describe('combinationOfTraitsAlreadyExists', () => {
  const selectedTraitsList = new Set();
  selectedTraitsList.add(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall);
  selectedTraitsList.add(BackgroundBlack_EyeballWhite_EyecolorPink_IrisMedium);
  selectedTraitsList.add(BackgroundBlack_EyeballRed_EyecolorRed_IrisLarge);

  it('should accept any combination of traits if no restriction is specified', () => {
    expect(combinationOfTraitsAlreadyExists(selectedTraitsList, BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall)).toBeFalsy();
  });

  it('should accept any combination of traits if there are no previously selected traits', () => {
    expect(combinationOfTraitsAlreadyExists(new Set(), BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, 2)).toBeFalsy();
  });

  it('should accept the new DNA if the number of max repeated traits is bigger than the number of used traits', () => {
    expect(combinationOfTraitsAlreadyExists(selectedTraitsList, BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, 5)).toBeFalsy();
  });

  it('should accept the new DNA if the number of max repeated traits is equal to the number of used traits', () => {
    expect(combinationOfTraitsAlreadyExists(selectedTraitsList, BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, 4)).toBeFalsy();
  });

  it('should accept the new DNA if the list does not contain elements with more repeated treats than the specified', () => {
    expect(combinationOfTraitsAlreadyExists(selectedTraitsList, BackgroundBlack_EyeballWhite_EyecolorPink_IrisLarge, 3)).toBeFalsy();
  });

  it('should not accept the new DNA if the list does contain elements with more repeated treats than the specified', () => {
    expect(combinationOfTraitsAlreadyExists(selectedTraitsList, BackgroundBlack_EyeballWhite_EyecolorPink_IrisLarge, 2)).toBeTruthy();
  });
});
