import React from 'react';
import { mount } from 'cypress-react-unit-test';
import { DiagramComponent } from '../../../main/js/chart_page/ui-components/diagramComponent';

const mountConfig = {
  cssFile: './src/main/js/chart_page/styles/style.css',
};
describe('DiagramComponent', () => {
  it('loads correctly', () => {
    cy.fixture('miniIssueData.json').then((issueData) => {
      cy.fixture('miniRuleData.json').then((ruleData) => {
        mount(
          <DiagramComponent
            rules={ruleData}
            issues={issueData}
            filteredRuleKeys={[]}
          />,
          mountConfig
        ).then(() => {
          cy.wait(1000); // wait for diagram loading animation to be completed

          // @ts-ignore
          cy.matchImageSnapshot();

          // cy.document()
          //  .toMatchImageSnapshot(matchImageSnapshotConfig);
          // cy.get("body").toMatchSnapshot();
        });
      });
    });
  });
});
