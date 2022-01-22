const { incompatibleTraitsUsed } = require('./incompatible_traits');
const {
  BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall,
  IncompatibleTraitsSimple,
  IncompatibleTraitsComplex,
  IncompatibleTraitsInvalidMain,
  IncompatibleTraitsInvalidChild,
} = require('../__fixtures__/traits');

describe('incompatibleTraitsUsed', () => {
  it('should accept new traits if there are no incompatible traits defined', () => {
    expect(incompatibleTraitsUsed(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall)).toBeFalsy();
  });

  it('should accept new traits if they do not contain incompatible traits', () => {
    expect(incompatibleTraitsUsed(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, IncompatibleTraitsSimple)).toBeFalsy();
  });

  it('should not accept new traits if they contain incompatible traits', () => {
    expect(incompatibleTraitsUsed(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, IncompatibleTraitsComplex)).toBeTruthy();
  });

  it('should ignore non existing traits in the configuration', () => {
    expect(incompatibleTraitsUsed(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, IncompatibleTraitsInvalidMain)).toBeFalsy();
    expect(incompatibleTraitsUsed(BackgroundBlack_EyeballWhite_EyecolorPink_IrisSmall, IncompatibleTraitsInvalidChild)).toBeFalsy();
  });
});
