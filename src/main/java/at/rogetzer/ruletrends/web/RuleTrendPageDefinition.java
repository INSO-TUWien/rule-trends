package at.rogetzer.ruletrends.web;

import org.sonar.api.web.page.Context;
import org.sonar.api.web.page.Page;
import org.sonar.api.web.page.PageDefinition;

import static org.sonar.api.web.page.Page.Scope.COMPONENT;

public class RuleTrendPageDefinition implements PageDefinition {

    @Override
    public void define(Context context) {

        context.addPage(Page.builder("ruletrends/chart_page")
                .setName("Rule Trends")
                .setScope(COMPONENT)
                .build());
    }
}
