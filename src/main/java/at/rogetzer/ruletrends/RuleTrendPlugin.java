package at.rogetzer.ruletrends;

import at.rogetzer.ruletrends.web.RuleTrendPageDefinition;
import org.sonar.api.Plugin;

public class RuleTrendPlugin implements Plugin {

    @Override
    public void define(Context context) {

        context.addExtension(RuleTrendPageDefinition.class);
    }
}
