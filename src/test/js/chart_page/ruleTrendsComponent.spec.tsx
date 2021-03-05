import { mount } from 'cypress-react-unit-test';
import { RuleTrendsComponent } from '../../../main/js/chart_page/ui-components/ruleTrendsComponent';
import React from 'react';
import moment from 'moment';

const mountConfig = {
  cssFile: './src/main/js/chart_page/styles/style.css',
};

const convertDatesToUnix = (issueData: any) => {
  issueData.forEach((i: any) => {
    i.date = moment(i.date).unix();
    i.issues.forEach((issue: any) => {
      issue.creationDate = moment(issue.creationDate).unix();
    });
  });
};

describe('RuleTrendsComponent initial', function () {
  it('loads correctly', () => {
    cy.stub(window.localStorage, 'getItem')
      .withArgs('sonar_recent_history')
      .returns(
        JSON.stringify([
          {
            key: '',
            organization: '',
          },
        ])
      );

    cy.fixture('miniIssueData.json').then((issueData) => {
      cy.fixture('miniRuleData.json').then((ruleData) => {
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          // @ts-ignore
          cy.matchImageSnapshot();
        });
      });
    });
  });
});

describe('RuleTrendsComponent', function () {
  beforeEach(() => {
    cy.stub(window.localStorage, 'getItem')
      .withArgs('sonar_recent_history')
      .returns(
        JSON.stringify([
          {
            key: '',
            organization: '',
          },
        ])
      );
  });

  it('loads correctly with real data', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          // @ts-ignore
          cy.matchImageSnapshot();
        });
      });
    });
  });

  it('supports zooming', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          cy.get('.wrapper')
            .trigger('mousedown', 100, 300)
            .trigger('mousemove', 300, 300)
            .trigger('mouseup', 300, 300);

          cy.wait(2000);

          // @ts-ignore
          cy.matchImageSnapshot();
        });
      });
    });
  });

  it('displays zoom selection window', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          cy.get('.wrapper')
            .trigger('mousedown', 100, 300)
            .trigger('mousemove', 300, 300);

          cy.wait(1000);

          // @ts-ignore
          cy.matchImageSnapshot();
        });
      });
    });
  });

  it('reset zoom works', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          cy.get('.wrapper')
            .trigger('mousedown', 100, 300)
            .trigger('mousemove', 300, 300)
            .trigger('mouseup', 300, 300);

          cy.wait(2000);
          // @ts-ignore
          cy.matchImageSnapshot('reset-zoom-01');

          cy.get('#btnResetZoom').click();

          cy.wait(2000);

          // @ts-ignore
          cy.matchImageSnapshot('reset-zoom-02');
        });
      });
    });
  });

  it('can filter rule', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          cy.get('.ruleMultiSelect').type('TODO{enter}');

          cy.wait(1000);

          // @ts-ignore
          cy.matchImageSnapshot('can-filter-rule');
        });
      });
    });
  });

  it('can filter multiple rules', () => {
    cy.fixture('exampleIssueData.json').then((issueData) => {
      cy.fixture('exampleRuleData.json').then((ruleData) => {
        convertDatesToUnix(issueData);
        mount(
          <RuleTrendsComponent
            days={365}
            issueData={issueData}
            ruleData={ruleData}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          cy.get('.ruleMultiSelect').type('TODO{enter}').type('Null{enter}');

          cy.wait(1000);

          // @ts-ignore
          cy.matchImageSnapshot('can-filter-multiple-rules');
        });
      });
    });
  });
});
