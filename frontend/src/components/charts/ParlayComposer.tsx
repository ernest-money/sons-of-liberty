import { useState, useEffect } from "react";
import { Plus, X, HelpCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartDataType,
  CHART_DATA_TYPES,
  TransformationFunction,
  TRANSFORMATION_FUNCTIONS
} from "@/types/chart-data-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PayoutChart } from "./PayoutChart";

interface ContractCondition {
  type: 'above' | 'below';
  value: number;
  transformation: TransformationFunction;
  weight: number;
  range: number;
}

interface TabItem {
  id: string;
  title: string;
  dataType?: ChartDataType;
  condition?: ContractCondition;
}

interface ParlayComposerProps {
  totalCollateral: number;
}

export const ParlayComposer: React.FC<ParlayComposerProps> = ({ totalCollateral }) => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [tabCounter, setTabCounter] = useState(1);
  const [showDataTypeSelector, setShowDataTypeSelector] = useState(false);

  // Create a direct add function for the empty state
  const addFirstTab = (dataType: ChartDataType) => {
    const dataTypeInfo = CHART_DATA_TYPES.find(dt => dt.id === dataType);
    const newTab: TabItem = {
      id: `chart-${tabCounter}`,
      title: dataTypeInfo?.label || `Chart ${tabCounter}`,
      dataType,
      condition: {
        type: 'above',
        value: dataTypeInfo?.defaultValue || 0,
        transformation: "linear",
        weight: 1.0,
        range: Math.round((dataTypeInfo?.upperBound || 0) - (dataTypeInfo?.lowerBound || 0)) / 2
      }
    };
    setTabs([newTab]);
    setActiveTab(newTab.id);
    setTabCounter(tabCounter + 1);
    setShowDataTypeSelector(false);
  };

  const addTab = () => {
    setShowDataTypeSelector(true);
  };

  const handleSelectDataType = (dataType: ChartDataType) => {
    // If there are no tabs, use the direct method
    if (tabs.length === 0) {
      addFirstTab(dataType);
      return;
    }

    const dataTypeInfo = CHART_DATA_TYPES.find(dt => dt.id === dataType);
    const newTab: TabItem = {
      id: `chart-${tabCounter}`,
      title: dataTypeInfo?.label || `Chart ${tabCounter}`,
      dataType,
      condition: {
        type: 'above',
        value: dataTypeInfo?.defaultValue || 0,
        transformation: "linear",
        weight: 1.0,
        range: Math.round((dataTypeInfo?.upperBound || 0) - (dataTypeInfo?.lowerBound || 0)) / 2
      }
    };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTab(newTab.id);
    setTabCounter(tabCounter + 1);
    setShowDataTypeSelector(false);
  };

  const updateTabDataType = (tabId: string, dataType: ChartDataType) => {
    const dataTypeInfo = CHART_DATA_TYPES.find(dt => dt.id === dataType);
    setTabs(tabs.map(tab =>
      tab.id === tabId
        ? {
          ...tab,
          dataType,
          title: dataTypeInfo?.label || tab.title,
          condition: {
            type: 'above' as const,
            value: dataTypeInfo?.defaultValue || 0,
            transformation: tab.condition?.transformation || "linear",
            weight: tab.condition?.weight || 1.0,
            range: Math.round((dataTypeInfo?.upperBound || 0) - (dataTypeInfo?.lowerBound || 0)) / 2
          }
        }
        : tab
    ));
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (tabs.length === 1) {
      // If removing the last tab, clear everything
      setTabs([]);
      setActiveTab("");
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);

    // If we're removing the active tab, set the active tab to the first remaining tab
    if (activeTab === id) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateConditionValue = (tabId: string, value: number) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId && tab.condition
        ? { ...tab, condition: { ...tab.condition, value } }
        : tab
    ));
  };

  const updateConditionType = (tabId: string, type: 'above' | 'below') => {
    setTabs(tabs.map(tab =>
      tab.id === tabId && tab.condition
        ? { ...tab, condition: { ...tab.condition, type } }
        : tab
    ));
  };

  const updateTransformationFunction = (tabId: string, transformation: TransformationFunction) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId && tab.condition
        ? { ...tab, condition: { ...tab.condition, transformation } }
        : tab
    ));
  };

  const updateWeight = (tabId: string, weight: number) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId && tab.condition
        ? { ...tab, condition: { ...tab.condition, weight } }
        : tab
    ));
  };

  const updateRange = (tabId: string, range: number) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId && tab.condition
        ? { ...tab, condition: { ...tab.condition, range } }
        : tab
    ));
  };

  const getDataTypeInfo = (dataType?: ChartDataType) => {
    return dataType ? CHART_DATA_TYPES.find(dt => dt.id === dataType) : undefined;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Function to get the transformation function info
  const getTransformationInfo = (transformation: TransformationFunction) => {
    return TRANSFORMATION_FUNCTIONS.find(tf => tf.id === transformation);
  };

  // If there are no tabs, show the empty state
  if (tabs.length === 0) {
    return (
      <div className="w-full">
        <div className="border rounded-md">
          <div className="flex flex-col items-center justify-center text-center py-12 px-8">
            <h3 className="text-xl font-medium mb-2">Add Your First Parameter</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Begin creating your parlay contract by adding a parameter based on Bitcoin network data
            </p>
            <Button onClick={() => setShowDataTypeSelector(true)} className="px-6">
              <Plus size={16} className="mr-2" />
              Add Parameter
            </Button>
          </div>
        </div>

        {/* Data type selector modal - placed directly in the same component for empty state */}
        {showDataTypeSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Select Data Type</h3>
              <div className="space-y-2">
                {CHART_DATA_TYPES.map((dataType) => (
                  <button
                    key={dataType.id}
                    className="w-full text-left p-3 hover:bg-muted rounded flex flex-col"
                    onClick={() => handleSelectDataType(dataType.id)}
                  >
                    <span className="font-medium">{dataType.label}</span>
                    <span className="text-sm text-muted-foreground">{dataType.description}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDataTypeSelector(false)}
                className="mt-4 w-full p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="rounded-t-md border border-border border-b-0">
          <TabsList className="justify-start w-full rounded-b-none border-b border-b-border bg-transparent h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center data-[state=active]:bg-muted rounded-none px-4 py-2 border-r border-r-border"
              >
                {tab.title}
                <button
                  onClick={(e) => removeTab(tab.id, e)}
                  className="ml-2 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X size={14} />
                </button>
              </TabsTrigger>
            ))}
            <button
              onClick={addTab}
              className="p-2 hover:bg-muted/80 transition-colors h-full flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </TabsList>
        </div>

        {tabs.map((tab) => {
          const dataTypeInfo = getDataTypeInfo(tab.dataType);

          return (
            <TabsContent key={tab.id} value={tab.id} className="pb-4 px-4 mt-0 border rounded-md rounded-t-none border-t-0">
              <h3 className="font-medium mb-4 pt-4">Parameter Settings</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor={`data-type-${tab.id}`}>Data Type</Label>
                  <Select
                    value={tab.dataType}
                    onValueChange={(value) => updateTabDataType(tab.id, value as ChartDataType)}
                  >
                    <SelectTrigger id={`data-type-${tab.id}`} className="w-full">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_DATA_TYPES.map((dataType) => (
                        <SelectItem key={dataType.id} value={dataType.id}>
                          {dataType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tab.dataType && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {dataTypeInfo?.description}
                    </p>
                  )}
                </div>

                {tab.dataType && tab.condition && dataTypeInfo && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Payout Curve</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="inline-block w-3 h-3 bg-primary rounded-sm mr-1"></span>
                          <span>Payout</span>
                          <span className="inline-block w-3 h-0.5 border-t border-dashed border-destructive mx-1"></span>
                          <span>Threshold</span>
                        </div>
                      </div>
                      <Card>
                        <CardContent className="py-4">
                          <PayoutChart
                            dataType={dataTypeInfo}
                            threshold={tab.condition.value}
                            range={tab.condition.range}
                            isAboveThreshold={tab.condition.type === 'above'}
                            transformation={tab.condition.transformation}
                            weight={tab.condition.weight}
                            totalCollateral={totalCollateral}
                            height="250px"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Label className="mb-2 block">Contract Condition</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`above-${tab.id}`}
                            checked={tab.condition.type === 'above'}
                            onChange={() => updateConditionType(tab.id, 'above')}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`above-${tab.id}`}>Above</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`below-${tab.id}`}
                            checked={tab.condition.type === 'below'}
                            onChange={() => updateConditionType(tab.id, 'below')}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`below-${tab.id}`}>Below</Label>
                        </div>
                      </div>

                      <Card className="mt-4">
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Select the threshold value for your contract or enter a custom value between {formatNumber(dataTypeInfo.lowerBound)} and {formatNumber(dataTypeInfo.upperBound)} {dataTypeInfo.unit}
                          </p>

                          <div className="flex items-center space-x-4 mt-4">
                            <div className="flex-1 space-y-2">
                              <Slider
                                value={[tab.condition.value]}
                                min={dataTypeInfo.lowerBound}
                                max={dataTypeInfo.upperBound}
                                step={(dataTypeInfo.upperBound - dataTypeInfo.lowerBound) / 100}
                                onValueChange={([value]) => updateConditionValue(tab.id, value)}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatNumber(dataTypeInfo.lowerBound)}</span>
                                <span>{formatNumber(dataTypeInfo.upperBound)}</span>
                              </div>
                            </div>
                            <div className="w-32">
                              <Input
                                type="number"
                                value={tab.condition.value}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value) && value >= dataTypeInfo.lowerBound && value <= dataTypeInfo.upperBound) {
                                    updateConditionValue(tab.id, value);
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-sm">{dataTypeInfo.unit}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`range-${tab.id}`} className="mb-2">Range</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                <HelpCircle size={14} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Range defines how far from the threshold value the condition will be evaluated for partial payments.
                                For "Above" conditions, this is how much above the threshold to reach 100%.
                                For "Below" conditions, this is how much below.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Slider
                            id={`range-${tab.id}`}
                            value={[tab.condition.range]}
                            min={0}
                            max={Math.round((dataTypeInfo.upperBound - dataTypeInfo.lowerBound) / 2)}
                            step={Math.round((dataTypeInfo.upperBound - dataTypeInfo.lowerBound) / 200)}
                            onValueChange={([value]) => updateRange(tab.id, value)}
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={tab.condition.range}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                updateRange(tab.id, value);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <span className="text-sm">{dataTypeInfo.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`transformation-${tab.id}`} className="mb-2">Transformation Function</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                <HelpCircle size={14} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Transformation functions determine how the normalized value (0-1) of this parameter affects the final payout.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={tab.condition.transformation}
                        onValueChange={(value) => updateTransformationFunction(tab.id, value as TransformationFunction)}
                      >
                        <SelectTrigger id={`transformation-${tab.id}`} className="w-full">
                          <SelectValue placeholder="Select transformation" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSFORMATION_FUNCTIONS.map((tf) => (
                            <SelectItem key={tf.id} value={tf.id}>
                              {tf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {tab.condition.transformation && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {getTransformationInfo(tab.condition.transformation)?.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`weight-${tab.id}`} className="mb-2">Weight</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                <HelpCircle size={14} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Weight determines how much influence this parameter has in the final payout calculation when using weighted combination methods.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Slider
                            id={`weight-${tab.id}`}
                            value={[tab.condition.weight]}
                            min={0.1}
                            max={5.0}
                            step={0.1}
                            onValueChange={([value]) => updateWeight(tab.id, value)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0.1</span>
                            <span>5.0</span>
                          </div>
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            value={tab.condition.weight}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0.1 && value <= 5.0) {
                                updateWeight(tab.id, value);
                              }
                            }}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {showDataTypeSelector && tabs.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Select Data Type</h3>
            <div className="space-y-2">
              {CHART_DATA_TYPES.map((dataType) => (
                <button
                  key={dataType.id}
                  className="w-full text-left p-3 hover:bg-muted rounded flex flex-col"
                  onClick={() => handleSelectDataType(dataType.id)}
                >
                  <span className="font-medium">{dataType.label}</span>
                  <span className="text-sm text-muted-foreground">{dataType.description}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDataTypeSelector(false)}
              className="mt-4 w-full p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 