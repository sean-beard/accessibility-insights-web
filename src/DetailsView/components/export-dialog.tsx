// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { FlaggedComponent } from 'common/components/flagged-component';
import { FeatureFlags } from 'common/feature-flags';
import { FeatureFlagStoreData } from 'common/types/store-data/feature-flag-store-data';
import { Dialog, DialogFooter, DialogType, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { ReportExportServiceProvider } from 'report-export/report-export-service-provider';
import { ExportFormat } from 'report-export/types/report-export-service';
import { ExportResultType } from '../../common/extension-telemetry-events';
import { FileURLProvider } from '../../common/file-url-provider';
import { NamedFC } from '../../common/react/named-fc';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';

export interface ExportDialogProps {
    deps: ExportDialogDeps;
    isOpen: boolean;
    fileName: string;
    description: string;
    html: string;
    onClose: () => void;
    onDescriptionChange: (value: string) => void;
    exportResultsType: ExportResultType;
    onExportClick: () => void;
    featureFlagStoreData: FeatureFlagStoreData;
}

export interface ExportDialogDeps {
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
    fileURLProvider: FileURLProvider;
    reportExportServiceProvider: ReportExportServiceProvider;
}

export const ExportDialog = NamedFC<ExportDialogProps>('ExportDialog', props => {
    const [format, setFormat] = React.useState<ExportFormat | null>(null);

    const onDismiss = (): void => {
        props.onClose();
    };

    const onExportLinkClick = (
        event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
        exportFormat: ExportFormat,
    ): void => {
        const { detailsViewActionMessageCreator } = props.deps;
        props.onDescriptionChange(props.description);
        detailsViewActionMessageCreator.exportResultsClicked(
            props.exportResultsType,
            props.html,
            event,
        );
        setFormat(exportFormat);
        props.onExportClick();
        props.onClose();
    };

    const onDescriptionChange = (event, value: string): void => {
        props.onDescriptionChange(value);
    };

    const fileURL = props.deps.fileURLProvider.provideURL([props.html], 'text/html');
    const exportService = props.deps.reportExportServiceProvider.forKey(format);
    const ExportForm = exportService ? exportService.exportForm : null;

    const getSingleExportToHtmlButton = () => {
        return (
            <PrimaryButton
                onClick={event =>
                    onExportLinkClick(event as React.MouseEvent<HTMLAnchorElement>, 'download')
                }
                download={props.fileName}
                href={fileURL}
            >
                Export
            </PrimaryButton>
        );
    };

    const getMultiOptionExportButton = () => {
        return (
            <>
                <PrimaryButton
                    text="Export"
                    split
                    splitButtonAriaLabel="Export HTML to any of these format options"
                    aria-roledescription="split button"
                    menuProps={{
                        items: props.deps.reportExportServiceProvider.all().map(service => ({
                            key: service.key,
                            text: service.displayName,
                            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                onExportLinkClick(e, service.key);
                            },
                        })),
                    }}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        onExportLinkClick(e, 'download');
                    }}
                    download={props.fileName}
                    href={fileURL}
                />
                {ExportForm && (
                    <ExportForm
                        fileName={props.fileName}
                        description={props.description}
                        html={props.html}
                        onSubmit={() => {
                            setFormat(null);
                        }}
                    />
                )}
            </>
        );
    };

    return (
        <Dialog
            hidden={!props.isOpen}
            onDismiss={onDismiss}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Provide result description',
                subText: 'Optional: please describe the result (it will be saved in the report).',
            }}
            modalProps={{
                isBlocking: false,
                containerClassName: 'insights-dialog-main-override',
            }}
        >
            <TextField
                multiline
                autoFocus
                rows={8}
                resizable={false}
                onChange={onDescriptionChange}
                value={props.description}
                ariaLabel="Provide result description"
            />
            <DialogFooter>
                <FlaggedComponent
                    featureFlag={FeatureFlags.exportReport}
                    featureFlagStoreData={props.featureFlagStoreData}
                    enableJSXElement={getMultiOptionExportButton()}
                    disableJSXElement={getSingleExportToHtmlButton()}
                />
            </DialogFooter>
        </Dialog>
    );
});
