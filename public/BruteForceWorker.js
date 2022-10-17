onmessage = function ({ data }) {
  const password = data.password;
  const ranges = data.ranges;

  const combinations = findPassword(password, ranges);

  postMessage(combinations);
};

/* function asyncTimeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function simulateServerResponse(testString: string, password: string) {
    await asyncTimeout(formik.values.responseTime);
    return testString === password;
  } */

const fullCharSets = {
  az: 'abcdefghijklmnopqrstuvwxyz',
  AZ: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numerical: '0123456789',
  special: '!"#$%&\'()*+,-.:;<=>?@[]^_`{|}~*/',
};
function findPassword(password, ranges) {
  const MAX_LENGTH = password.length;
  const ALL_CHARS = Object.entries(fullCharSets)
    .reduce((result, [key, value]) => {
      if (ranges.includes(key)) {
        result = result + value;
      }
      return result;
    }, '')
    .split('');

  let testStringLength = 1;
  let validPassword = null;
  let combinations = 0;

  while (testStringLength <= MAX_LENGTH && !validPassword) {
    function fn(prefix, remainingDigits) {
      if (remainingDigits === 1) {
        for (const char of ALL_CHARS) {
          const combo = String(prefix + char);
          // combinations.push(combo);
          combinations++;
          if (combo === password) return combo;
        }
      } else {
        for (const char of ALL_CHARS) {
          const res = fn(prefix + char, remainingDigits - 1);
          if (res) {
            validPassword = res;
            return res;
          }
        }
      }
    }

    fn('', testStringLength);
    testStringLength++;
  }
  return combinations;
}
