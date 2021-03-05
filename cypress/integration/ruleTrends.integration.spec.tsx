describe('RuleTrendsComponent RuleTrendsService integration', function () {
  // TODO: a precondition to run the tests is that the mock server
  // is up and running, listening on port 9010. Maybe automatically start it before
  // executing

  beforeEach(() => {
    cy.server({
      whitelist: (xhr) => true, // do not intercept XHR requests
    });

    cy.setLocalStorage(
      'sonar_recent_history',
      JSON.stringify([
        {
          key: 'test',
          organization: 'default-organization',
        },
      ])
    );
  });

  it('loads correctly', () => {
    cy.setLocalStorage('rule_trends_start_date', '1594245599');

    cy.visit('http://localhost:3000/index.html');

    cy.get('#ruleTrendsComponent', { timeout: 10000 }).should('be.visible');

    cy.wait(2000); // diagram loading animation

    // @ts-ignore
    cy.matchImageSnapshot('int-loads-correctly');

    cy.removeLocalStorage('rule_trends_start_date');
  });

  // TODO: add test: fetch api produces issueData and ruleData

  // TODO: add unit tests for RuleTrendsService

  it('issue api returns expected data', () => {
    cy.request('http://localhost:3000/api/issues/search?componentKeys=test&p=1')
      .its('body')
      .as('issueData')
      .then(function () {
        const issueData = this.issueData;
        expect(issueData).to.have.property('issues');
        expect(issueData.issues).to.be.an('array').that.is.not.empty;

        const issue = issueData.issues[0];
        expect(issue).to.have.property('key');
        expect(issue).to.have.property('rule');
        expect(issue).to.have.property('status');
        expect(issue).to.have.property('creationDate');
      });
  });

  it('rule api returns expected data', () => {
    cy.request(
      'http://localhost:3000/api/rules/search?organization=default-organization&rule_key=squid:S2259'
    )
      .its('body')
      .as('ruleData')
      .then(function () {
        const ruleData = this.ruleData;
        expect(ruleData).to.have.property('rules');
        expect(ruleData.rules).to.be.an('array').that.is.not.empty;

        const rule = ruleData.rules[0];
        expect(rule).to.have.property('key');
        expect(rule).to.have.property('name');
      });
  });

  it('issue changelog api returns expected data', () => {
    cy.request(
      'http://localhost:3000/api/issues/changelog?issue=AXDAtBx3kHPug4J6HPL1'
    )
      .its('body')
      .as('changeLogData')
      .then(function () {
        const changeLogData = this.changeLogData;
        expect(changeLogData).to.have.property('changelog');
        expect(changeLogData.changelog).to.be.an('array').that.is.not.empty;

        const changeLogEntry = changeLogData.changelog[0];
        expect(changeLogEntry).to.have.property('creationDate');
        expect(changeLogEntry)
          .to.have.property('diffs')
          .that.is.an('array').that.is.not.empty;

        const diff = changeLogEntry.diffs[2];
        expect(diff).to.have.property('key').that.eq('status');
        expect(diff).to.have.property('newValue').that.eq('CLOSED');
      });
  });

  // add issue changelog check

  // add issueService check

  // etc

  // add ruleTrendsService check
});
