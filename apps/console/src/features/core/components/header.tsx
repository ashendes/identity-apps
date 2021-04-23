/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { resolveAppLogoFilePath } from "@wso2is/core/helpers";
import { AnnouncementBannerInterface, ProfileInfoInterface } from "@wso2is/core/models";
import { CommonUtils as ReusableCommonUtils } from "@wso2is/core/utils";
import {
    Announcement,
    Logo,
    ProductBrand,
    Header as ReusableHeader,
    HeaderPropsInterface as ReusableHeaderPropsInterface,
    ThemeContext
} from "@wso2is/react-components";
import isEmpty from "lodash-es/isEmpty";
import React, {
    FunctionComponent,
    ReactElement,
    useContext,
    useEffect,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Container, Image, Menu } from "semantic-ui-react";
import { ComponentPlaceholder } from "../../../extensions";
import { getMiscellaneousIcons } from "../configs";
import { history } from "../helpers";
import { ConfigReducerStateInterface } from "../models";
import { AppState } from "../store";
import { CommonUtils } from "../utils";

/**
 * Dashboard layout Prop types.
 */
interface HeaderPropsInterface extends Omit<ReusableHeaderPropsInterface, "basicProfileInfo" | "profileInfo"> {
    /**
     * Active view.
     */
    activeView?: "ADMIN" | "DEVELOPER";
    /**
     * Flag to show/hide manage view.
     */
    isManageViewAllowed?: boolean;
}

/**
 * Implementation of the Reusable Header component.
 *
 * @param {HeaderPropsInterface} props - Props injected to the component.
 * @return {React.ReactElement}
 */
export const Header: FunctionComponent<HeaderPropsInterface> = (
    props: HeaderPropsInterface
): ReactElement => {

    const {
        isManageViewAllowed,
        activeView,
        fluid,
        onSidePanelToggleClick,
        [ "data-testid" ]: testId,
        ...rest
    } = props;

    const { state } = useContext(ThemeContext);

    const { t } = useTranslation();

    const profileInfo: ProfileInfoInterface = useSelector((state: AppState) => state.profile.profileInfo);
    const isProfileInfoLoading: boolean = useSelector(
        (state: AppState) => state.loaders.isProfileInfoRequestLoading);
    const config: ConfigReducerStateInterface = useSelector((state: AppState) => state.config);

    const [ announcement, setAnnouncement ] = useState<AnnouncementBannerInterface>(undefined);

    const showAppSwitchButton: boolean = useSelector(
        (state: AppState) => state?.config?.ui?.showAppSwitchButton);   

    useEffect(() => {
        if (isEmpty(config)) {
            return;
        }

        if (!config?.ui?.announcements
            || !(config?.ui?.announcements instanceof Array)
            || (config?.ui?.announcements.length < 1)) {

            return;
        }

        setAnnouncement(ReusableCommonUtils.getValidAnnouncement(config.ui.announcements,
            CommonUtils.getSeenAnnouncements()));
    }, [ config ]);

    /**
     * Handles announcement dismiss callback.
     */
    const handleAnnouncementDismiss = () => {
        CommonUtils.setSeenAnnouncements(announcement.id);

        const validAnnouncement = ReusableCommonUtils.getValidAnnouncement(config.ui.announcements,
            CommonUtils.getSeenAnnouncements());

        if (!validAnnouncement) {
            setAnnouncement(null);
            return;
        }

        setAnnouncement(validAnnouncement);
    };

    return (
        <ReusableHeader
            announcement={ announcement && (
                <Announcement
                    message={ announcement.message }
                    onDismiss={ handleAnnouncementDismiss }
                    color={ announcement.color }
                />
            ) }
            brand={ (
                <ProductBrand
                    appName={
                        (state.appName && state.appName !== "")
                            ? state.appName
                            : config.ui.appName
                    }
                    style={ { marginTop: 0 } }
                    logo={
                        (state.logo && state.logo !== "")
                            ? <Image src={ state.logo } style={ { maxHeight: 25 } }/>
                            : (
                                <Logo
                                    className="portal-logo"
                                    image={
                                        resolveAppLogoFilePath(window[ "AppUtils" ].getConfig().ui.appLogoPath,
                                            `${ window[ "AppUtils" ].getConfig().clientOrigin }/` +
                                            `${ window[ "AppUtils" ].getConfig().appBase }/libs/themes/` +
                                            state.theme)
                                    }
                                />
                            )
                    }
                    version={ config.ui.productVersionConfig?.versionOverride ?? config.deployment.productVersion }
                    versionUISettings={ {
                        allowSnapshot: config.ui.productVersionConfig?.allowSnapshot,
                        labelColor: config.ui.productVersionConfig?.labelColor,
                        textCase: config.ui.productVersionConfig?.textCase
                    } }
                />
            ) }
            brandLink={ config.deployment.appHomePath }
            basicProfileInfo={ profileInfo }
            extensions={ [
                {
                    component: (
                        <Menu.Item key={ "feedback-button" }>
                            <ComponentPlaceholder section="feedback-button" type="component"/>
                        </Menu.Item>
                    ),
                    floated: "right"
                },
                {
                    component: (
                        <Menu.Item key={ "app-switch-button" }>
                            <ComponentPlaceholder section="app-switch-button" type="component"/>
                        </Menu.Item>
                    ),
                    floated: "right"
                },
                {
                    component: (
                        <Menu.Item key={ "tenant-dropdown" }>
                            <ComponentPlaceholder section="tenant-dropdown" type="component"/>
                        </Menu.Item>
                    ),
                    floated: "right"
                }
            ] }
            fluid={ fluid }
            isProfileInfoLoading={ isProfileInfoLoading }
            userDropdownLinks={ 
                showAppSwitchButton
                ? [ 
                    {
                        icon: "power off",
                        name: t("common:logout"),
                        onClick: () => history.push(window[ "AppUtils" ].getConfig().routes.logout)
                    }
                ] : [
                    {
                        icon: "arrow right",
                        name: t("console:manage.features.header.links.userPortalNav"),
                        onClick: () => window.open(window[ "AppUtils" ].getConfig().accountApp.path,
                            "_blank", "noopener")
                    },{
                        icon: "power off",
                        name: t("common:logout"),
                        onClick: () => history.push(window[ "AppUtils" ].getConfig().routes.logout)
                    }
            ] }
            profileInfo={ profileInfo }
            showUserDropdown={ true }
            onSidePanelToggleClick={ onSidePanelToggleClick }
            data-testid={ testId }
            { ...rest }
        >
            {
                isManageViewAllowed && (
                    <div className="secondary-panel" data-testid={ `${ testId }-secondary-panel` }>
                        <Container fluid={ fluid }>
                            <Menu className="inner-menu">
                                <Menu.Item
                                    name={ config.deployment.developerApp.displayName }
                                    active={ activeView === "DEVELOPER" }
                                    className="portal-switch"
                                    onClick={ () => {
                                        history.push(config.deployment.developerApp.path);
                                    } }
                                    data-testid={ `${ testId }-developer-portal-switch` }
                                />
                                <Menu.Item
                                    name={ config.deployment.adminApp.displayName }
                                    active={ activeView === "ADMIN" }
                                    className="portal-switch"
                                    onClick={ () => {
                                        history.push(config.deployment.adminApp.path);
                                    } }
                                    data-testid={ `${ testId }-admin-portal-switch` }
                                />
                            </Menu>
                        </Container>
                    </div>
                )
            }
        </ReusableHeader>
    );
};

/**
 * Default props for the component.
 */
Header.defaultProps = {
    "data-testid": "app-header",
    fluid: true
};
