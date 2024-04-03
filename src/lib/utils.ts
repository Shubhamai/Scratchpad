import type { Folder, Note } from "$lib";

export function compareArrays(oldArray: Folder[] | Note[], newArray: Folder[] | Note[]) {
  const results: {
    missingInNew: (Folder | Note)[];
    missingInOld: (Folder | Note)[];
    updated: { old: Folder | Note; new: Folder | Note }[];
  } = {
    missingInNew: [],
    missingInOld: [],
    updated: []
  };

  // Using a simple function to generate a unique identifier for each object
  // Assuming each object has a unique 'id' field
  const getObjectIdentifier = (obj: Note | Folder) => obj.id;

  const oldMap = new Map();
  oldArray.forEach((obj) => oldMap.set(getObjectIdentifier(obj), obj));

  const newMap = new Map();
  newArray.forEach((obj) => newMap.set(getObjectIdentifier(obj), obj));

  // Check for objects missing in the new array and updated objects
  oldMap.forEach((value, key) => {
    if (!newMap.has(key)) {
      results.missingInNew.push(value);
    } else {
      const oldObj = value;
      const newObj = newMap.get(key);

      // Check if the objects are different (this can be improved based on your object's structure)
      if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
        results.updated.push({ old: oldObj, new: newObj });
      }
    }
  });

  // Check for objects missing in the old array
  newMap.forEach((value, key) => {
    if (!oldMap.has(key)) {
      results.missingInOld.push(value);
    }
  });

  return results;
}
