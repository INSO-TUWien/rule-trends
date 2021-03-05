import { Rule } from '../../src/main/js/chart_page/models/rule';
import { Issue } from '../../src/main/js/chart_page/models/issue';
import { StatusDiff } from '../../src/main/js/chart_page/models/statusDiff';
import { RuleService } from '../../src/main/js/chart_page/service/ruleService';
import { IssueService } from '../../src/main/js/chart_page/service/issueService';
import { IssueChangeLog } from '../../src/main/js/chart_page/models/issueChangeLog';
import { ChangeLogService } from '../../src/main/js/chart_page/service/changeLogService';
import moment from 'moment';

describe('RuleTrendsService integration', function () {
  const notifyPlaceHolder = () => {};
  const baseAddress = 'http://localhost:3000';

  it('issue service works', () => {
    const test: Issue = {
      key: 'AXDAtBx0kHPug4J6HPK_',
      rule: 'squid:S1135',
      status: 'CLOSED',
      creationDate: moment('2020-03-09T19:09:28+0000').unix(),
    };

    const service = new IssueService('test', baseAddress);

    // need to wrap request, as otherwise assertion error within promise is not treated properly,
    // see https://github.com/cypress-io/cypress/issues/6917
    cy.wrap(service.fetchIssues(notifyPlaceHolder)).then((issues) => {
      expect(issues).to.be.an('array');
      expect(issues).to.be.not.empty;

      const firstIssue = issues[0];

      expect(firstIssue).to.be.deep.equal(test);
    });
  });

  it('rule service works', () => {
    const test: Rule = {
      key: 'squid:S1135',
      name: 'Track uses of "TODO" tags',
    };

    const service = new RuleService('default-organization', baseAddress);

    cy.wrap(
      service.fetchRule('squid:S1135', notifyPlaceHolder)
    ).then((rule: Rule) => expect(rule).to.be.deep.equal(test));
  });

  it('changeLog service works', () => {
    const test: IssueChangeLog = {
      issueKey: 'AXDAtBx0kHPug4J6HPK_',
      changeLogEntries: [
        {
          creationDate: moment('2020-04-25T21:53:25+0000').unix(),
          diffs: [
            { key: 'status', newValue: 'CLOSED' } as StatusDiff,
          ] as StatusDiff[],
        },
      ],
    };

    const service = new ChangeLogService(baseAddress);

    cy.wrap(
      service.fetchIssueChangeLog('AXDAtBx0kHPug4J6HPK_', notifyPlaceHolder)
    ).then((obj) => expect(obj).to.deep.equal(test));
  });
});
