package system

import (
	"testing"
)

func TestCollectMetrics(t *testing.T) {
	metrics := CollectMetrics()
	if metrics == nil {
		t.Fatal("Expected metrics object, got nil")
	}

	if metrics.Hostname == "" {
		t.Error("Expected non-empty Hostname")
	}

	if metrics.OS == "" {
		t.Error("Expected non-empty OS")
	}

	if metrics.CPU.Cores <= 0 {
		t.Errorf("Expected CPU Cores > 0, got %d", metrics.CPU.Cores)
	}
}
