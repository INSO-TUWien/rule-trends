import { Rule } from '../models/rule';

/**
 * Service component responsible for fetching rule data
 */
export class RuleService {
  private api: string;

  /**
   * Initializes RuleService
   * @param {string} organizationKey - SonarQube organization key
   * @param {string} baseAddress (optional)
   */
  constructor(organizationKey: string, baseAddress: string = '') {
    this.api =
      baseAddress + '/api/rules/search?organization=' + organizationKey;
  }

  /**
   * Main method for fetching rule information
   * @param {string} ruleKey
   * @param {function} notifyProgressUpdate
   * @return {Rule}
   */
  fetchRule(ruleKey: string, notifyProgressUpdate: () => void) {
    return fetch(this.api + '&rule_key=' + ruleKey).then((res) => {
      notifyProgressUpdate();
      return res.json().then((d: any) => {
        return { key: d.rules[0].key, name: d.rules[0].name } as Rule;
      });
    });
  }
}
