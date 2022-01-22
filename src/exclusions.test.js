const { needsExclusion } = require('./exclusions');
const { combinationOfTraitsAlreadyExists } = require('./exclusions/combination_traits');
const { incompatibleTraitsUsed } = require('./exclusions/incompatible_traits');

jest.mock('./exclusions/combination_traits', () => ({
  combinationOfTraitsAlreadyExists: jest.fn(),
}));

jest.mock('./exclusions/incompatible_traits', () => ({
  incompatibleTraitsUsed: jest.fn(),
}));

describe('exclusions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  });

  describe('needsExclusion', () => {
    it('should not need to exclude the artwork if no data is provided', () => {
      expect(needsExclusion()).toBeFalsy();
    });

    it('should need to exclude the artwork if combination of traits already exists', () => {
      combinationOfTraitsAlreadyExists.mockReturnValue(true);
      incompatibleTraitsUsed.mockReturnValue(false);

      expect(needsExclusion()).toBeTruthy();
    });

    it('should need to exclude the artwork if incompatible traits are used', () => {
      combinationOfTraitsAlreadyExists.mockReturnValue(false);
      incompatibleTraitsUsed.mockReturnValue(true);

      expect(needsExclusion()).toBeTruthy();
    });
  });
});
