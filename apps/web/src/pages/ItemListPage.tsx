import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageLayout } from "@/components/layout/PageLayout";
import { ToastContainer, type ToastType } from "@/components/ui/Toast";
import { useItemStore } from "@/stores/itemStore";
import { formatDate } from "@/lib/utils";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export function ItemListPage() {
  const { items, isLoading, fetchItems, createItem, updateItem, deleteItem } = useItemStore();

  // Fetch items from API on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    try {
      await createItem({ title: newTitle, description: newDescription });
      setNewTitle("");
      setNewDescription("");
      setIsCreating(false);
      showToast("success", "Item created successfully");
    } catch {
      showToast("error", "Failed to create item");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      await updateItem(id, { title: editTitle, description: editDescription });
      setEditingId(null);
      showToast("success", "Item updated successfully");
    } catch {
      showToast("error", "Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      showToast("success", "Item deleted successfully");
    } catch {
      showToast("error", "Failed to delete item");
    }
  };

  const startEditing = (item: { id: string; title: string; description: string }) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  return (
    <PageLayout
      title="Items"
      description="Manage your items with full CRUD operations"
      actions={
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4" />
          New Item
        </Button>
      }
    >
      {/* Create Form */}
      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newTitle.trim()}>
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle("");
                  setNewDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No items yet. Create your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              {editingId === item.id ? (
                <CardContent className="pt-6 space-y-4">
                  <Input
                    placeholder="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <Input
                    placeholder="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(item.id)} disabled={!editTitle.trim()}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(item.createdAt)}
                      {item.updatedAt !== item.createdAt && (
                        <> &middot; Updated: {formatDate(item.updatedAt)}</>
                      )}
                    </p>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </PageLayout>
  );
}
