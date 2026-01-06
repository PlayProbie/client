export type InstanceTypeOption = {
  value: string;
  label: string;
  detail: string;
};

export const INSTANCE_TYPE_OPTIONS: InstanceTypeOption[] = [
  {
    value: 'gen6n_pro_win2022',
    label: 'Gen6 Pro (Windows)',
    detail: '16 vCPU / 64GB RAM / 24GB VRAM',
  },
  {
    value: 'gen6n_ultra_win2022',
    label: 'Gen6 Ultra (Windows)',
    detail: '8 vCPU / 32GB RAM / 24GB VRAM',
  },
  {
    value: 'gen6n_pro',
    label: 'Gen6 Pro (Linux)',
    detail: '16 vCPU / 64GB RAM / 24GB VRAM',
  },
  {
    value: 'gen6n_ultra',
    label: 'Gen6 Ultra (Linux)',
    detail: '8 vCPU / 32GB RAM / 24GB VRAM',
  },
  {
    value: 'gen6n_high',
    label: 'Gen6 High (Linux)',
    detail: '4 vCPU / 16GB RAM / 12GB VRAM',
  },
  {
    value: 'gen6n_medium',
    label: 'Gen6 Medium (Linux)',
    detail: '2 vCPU / 8GB RAM / 6GB VRAM',
  },
  {
    value: 'gen6n_small',
    label: 'Gen6 Small (Linux)',
    detail: '1 vCPU / 4GB RAM / 2GB VRAM',
  },
  {
    value: 'gen5n_win2022',
    label: 'Gen5 (Windows)',
    detail: '8 vCPU / 32GB RAM / 24GB VRAM',
  },
  {
    value: 'gen5n_ultra',
    label: 'Gen5 Ultra (Linux)',
    detail: '8 vCPU / 32GB RAM / 24GB VRAM',
  },
  {
    value: 'gen5n_high',
    label: 'Gen5 High (Linux)',
    detail: '4 vCPU / 16GB RAM / 12GB VRAM',
  },
  {
    value: 'gen4n_win2022',
    label: 'Gen4 (Windows)',
    detail: '8 vCPU / 32GB RAM / 16GB VRAM',
  },
  {
    value: 'gen4n_ultra',
    label: 'Gen4 Ultra (Linux)',
    detail: '8 vCPU / 32GB RAM / 16GB VRAM',
  },
  {
    value: 'gen4n_high',
    label: 'Gen4 High (Linux)',
    detail: '4 vCPU / 16GB RAM / 8GB VRAM',
  },
];

export const INSTANCE_TYPE_LABELS = INSTANCE_TYPE_OPTIONS.reduce<
  Record<string, string>
>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});
